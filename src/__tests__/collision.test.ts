import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkCollision, combine } from '../index'

// ---------------------------------------------------------------------------
// Pure utility tests — no DOM needed
// ---------------------------------------------------------------------------

describe('checkCollision', () => {
  it('returns true when rects overlap', () => {
    const r1 = { left: 0, top: 0, width: 100, height: 100 }
    const r2 = { left: 50, top: 50, width: 100, height: 100 }
    expect(checkCollision(r1, r2)).toBe(true)
  })

  it('returns false for rects that touch edge-to-edge (exclusive boundaries)', () => {
    // touching at x=100 but not overlapping
    const r1 = { left: 0, top: 0, width: 100, height: 100 }
    const r2 = { left: 100, top: 0, width: 100, height: 100 }
    expect(checkCollision(r1, r2)).toBe(false)
  })

  it('returns false for fully separated rects', () => {
    const r1 = { left: 0, top: 0, width: 100, height: 100 }
    const r2 = { left: 200, top: 200, width: 100, height: 100 }
    expect(checkCollision(r1, r2)).toBe(false)
  })

  it('returns true when one rect fully contains the other', () => {
    const outer = { left: 0, top: 0, width: 200, height: 200 }
    const inner = { left: 50, top: 50, width: 50, height: 50 }
    expect(checkCollision(outer, inner)).toBe(true)
    expect(checkCollision(inner, outer)).toBe(true)
  })

  it('is symmetric', () => {
    const r1 = { left: 10, top: 20, width: 80, height: 60 }
    const r2 = { left: 60, top: 50, width: 80, height: 60 }
    expect(checkCollision(r1, r2)).toBe(checkCollision(r2, r1))
  })
})

// ---------------------------------------------------------------------------
// combine — pure combinatorics
// ---------------------------------------------------------------------------

describe('combine', () => {
  it('returns empty array for 0 elements', () => {
    expect(combine([])).toEqual([])
  })

  it('returns empty array for 1 element', () => {
    expect(combine([42])).toEqual([])
  })

  it('returns one pair for 2 elements', () => {
    expect(combine(['a', 'b'])).toEqual([['a', 'b']])
  })

  it('returns 3 pairs for 3 elements (C(3,2)=3)', () => {
    const pairs = combine([1, 2, 3])
    expect(pairs).toHaveLength(3)
    expect(pairs).toContainEqual([1, 2])
    expect(pairs).toContainEqual([1, 3])
    expect(pairs).toContainEqual([2, 3])
  })

  it('returns C(n,2) pairs for n elements', () => {
    const n = 5
    const expected = (n * (n - 1)) / 2
    expect(combine([1, 2, 3, 4, 5])).toHaveLength(expected)
  })

  it('never includes [x, x] pairs', () => {
    const pairs = combine([1, 2, 3, 4])
    for (const [a, b] of pairs) {
      expect(a).not.toBe(b)
    }
  })
})

// ---------------------------------------------------------------------------
// Directive integration tests — viewport collision via IntersectionObserver
// ---------------------------------------------------------------------------

describe('v-collision directive — viewport (IntersectionObserver)', () => {
  let ioCallback: IntersectionObserverCallback
  let observeSpy: ReturnType<typeof vi.fn>
  let disconnectSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    observeSpy = vi.fn()
    disconnectSpy = vi.fn()

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          ioCallback = cb
        }
        observe = observeSpy
        unobserve = vi.fn()
        disconnect = disconnectSpy
      },
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls observe on the element when directive mounts', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    const wrapper = mount(
      { template: '<div v-collision />' },
      { global: { plugins: [VueCollision] } },
    )

    expect(observeSpy).toHaveBeenCalledWith(wrapper.element)
  })

  it('dispatches "collide" when IntersectionObserver fires with isIntersecting=true', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    const wrapper = mount(
      { template: '<div v-collision />' },
      { global: { plugins: [VueCollision] } },
    )

    const el = wrapper.element
    const received: string[] = []
    el.addEventListener('collide', () => received.push('collide'))
    el.addEventListener('non-collide', () => received.push('non-collide'))

    ioCallback([{ isIntersecting: true, target: el } as IntersectionObserverEntry], {} as IntersectionObserver)

    expect(received).toEqual(['collide'])
  })

  it('dispatches "non-collide" when IntersectionObserver fires with isIntersecting=false', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    const wrapper = mount(
      { template: '<div v-collision />' },
      { global: { plugins: [VueCollision] } },
    )

    const el = wrapper.element
    const received: string[] = []
    el.addEventListener('collide', () => received.push('collide'))
    el.addEventListener('non-collide', () => received.push('non-collide'))

    ioCallback([{ isIntersecting: false, target: el } as IntersectionObserverEntry], {} as IntersectionObserver)

    expect(received).toEqual(['non-collide'])
  })

  it('disconnects IntersectionObserver on unmount', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    const wrapper = mount(
      { template: '<div v-collision />' },
      { global: { plugins: [VueCollision] } },
    )

    wrapper.unmount()
    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('does NOT join viewport group when .prevent modifier is set', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    mount(
      { template: '<div v-collision.prevent />' },
      { global: { plugins: [VueCollision] } },
    )

    // IntersectionObserver.observe should never be called for prevent elements
    expect(observeSpy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Directive integration tests — element-element group collision via rAF
// ---------------------------------------------------------------------------

describe('v-collision directive — element groups (rAF + getBoundingClientRect)', () => {
  let rafCallback: FrameRequestCallback
  let rafId = 0
  let cancelledIds: number[]

  beforeEach(() => {
    cancelledIds = []

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = vi.fn()
      },
    )

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallback = cb
      return ++rafId
    })

    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      cancelledIds.push(id)
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('dispatches collide-groupA when two elements in same group overlap', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    // mount component with two colliding elements in the same group
    const wrapper = mount(
      {
        template: `
          <div>
            <div id="a" v-collision.prevent="['groupA']" />
            <div id="b" v-collision.prevent="['groupA']" />
          </div>
        `,
      },
      { global: { plugins: [VueCollision] } },
    )

    const elA = wrapper.find('#a').element as HTMLElement
    const elB = wrapper.find('#b').element as HTMLElement

    // Overlapping rects
    vi.spyOn(elA, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 100, height: 100,
      right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({})
    } as DOMRect)
    vi.spyOn(elB, 'getBoundingClientRect').mockReturnValue({
      left: 50, top: 50, width: 100, height: 100,
      right: 150, bottom: 150, x: 50, y: 50, toJSON: () => ({})
    } as DOMRect)

    const collisionsA: string[] = []
    const collisionsB: string[] = []
    elA.addEventListener('collide-groupA', () => collisionsA.push('collide'))
    elA.addEventListener('non-collide-groupA', () => collisionsA.push('non-collide'))
    elB.addEventListener('collide-groupA', () => collisionsB.push('collide'))
    elB.addEventListener('non-collide-groupA', () => collisionsB.push('non-collide'))

    // Trigger rAF callback (scheduled during mount)
    rafCallback(0)

    expect(collisionsA).toEqual(['collide'])
    expect(collisionsB).toEqual(['collide'])
  })

  it('dispatches non-collide-groupA when two elements do not overlap', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    const wrapper = mount(
      {
        template: `
          <div>
            <div id="a" v-collision.prevent="['groupB']" />
            <div id="b" v-collision.prevent="['groupB']" />
          </div>
        `,
      },
      { global: { plugins: [VueCollision] } },
    )

    const elA = wrapper.find('#a').element as HTMLElement
    const elB = wrapper.find('#b').element as HTMLElement

    // Non-overlapping rects
    vi.spyOn(elA, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 100, height: 100,
      right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({})
    } as DOMRect)
    vi.spyOn(elB, 'getBoundingClientRect').mockReturnValue({
      left: 200, top: 200, width: 100, height: 100,
      right: 300, bottom: 300, x: 200, y: 200, toJSON: () => ({})
    } as DOMRect)

    const collisionsA: string[] = []
    elA.addEventListener('collide-groupA', () => collisionsA.push('collide'))
    elA.addEventListener('non-collide-groupB', () => collisionsA.push('non-collide'))

    rafCallback(0)

    expect(collisionsA).toEqual(['non-collide'])
  })

  it('removes element from group on unmount and stops checking pairs', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    const wrapper = mount(
      {
        template: `
          <div>
            <div id="a" v-collision.prevent="['groupC']" />
            <div id="b" v-collision.prevent="['groupC']" />
          </div>
        `,
      },
      { global: { plugins: [VueCollision] } },
    )

    // Trigger initial rAF
    rafCallback(0)

    wrapper.unmount()

    // After unmount the group should have no combinations (elements removed)
    // A fresh rAF after unmount should not dispatch events
    const elA = wrapper.find('#a').element as HTMLElement
    const fired: string[] = []
    elA.addEventListener('collide-groupC', () => fired.push('collide'))
    elA.addEventListener('non-collide-groupC', () => fired.push('non-collide'))

    // trigger any remaining rAF
    if (rafCallback) rafCallback(0)

    expect(fired).toHaveLength(0)
  })
})
