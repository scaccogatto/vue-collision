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

  it('dispatches "collide" reaching @collide listener when isIntersecting=true', async () => {
    // DISCRIMINATING: uses Vue template @ binding to prove event reaches the handler.
    // Vue 3.5 template compiler generates `"on:collide"` which parseName resolves as
    // `addEventListener('collide', ...)` — exact name match with our dispatch.
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    const onCollide = vi.fn()
    const wrapper = mount(
      {
        template: '<div v-collision @collide="onCollide" />',
        methods: { onCollide },
      },
      { global: { plugins: [VueCollision] } },
    )

    ioCallback(
      [{ isIntersecting: true, target: wrapper.element } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(onCollide).toHaveBeenCalledOnce()
    expect((onCollide.mock.calls[0][0] as CustomEvent).detail).toBe(window)
  })

  it('dispatches "non-collide" reaching @non-collide listener when isIntersecting=false', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    const onNonCollide = vi.fn()
    const wrapper = mount(
      {
        template: '<div v-collision @non-collide="onNonCollide" />',
        methods: { onNonCollide },
      },
      { global: { plugins: [VueCollision] } },
    )

    ioCallback(
      [{ isIntersecting: false, target: wrapper.element } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(onNonCollide).toHaveBeenCalledOnce()
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

    expect(observeSpy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Directive integration tests — element-element group collision via rAF
// ---------------------------------------------------------------------------

describe('v-collision directive — element groups (rAF + getBoundingClientRect)', () => {
  let rafCallback: FrameRequestCallback
  let rafId = 0

  beforeEach(() => {
    rafId = 0

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

    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('dispatches collide-groupA reaching @collide-groupA listener when elements overlap', async () => {
    // DISCRIMINATING: proves the event name the directive dispatches (`collide-groupA`)
    // is what Vue 3.5 registers for `@collide-groupA` via the `on:event-name` prop format.
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    const onCollideA = vi.fn()
    const onCollideB = vi.fn()

    const wrapper = mount(
      {
        template: `
          <div>
            <div id="a" v-collision.prevent="['groupA']" @collide-groupA="onCollideA" />
            <div id="b" v-collision.prevent="['groupA']" @collide-groupA="onCollideB" />
          </div>
        `,
        methods: { onCollideA, onCollideB },
      },
      { global: { plugins: [VueCollision] } },
    )

    const elA = wrapper.find('#a').element as HTMLElement
    const elB = wrapper.find('#b').element as HTMLElement

    vi.spyOn(elA, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 100, height: 100,
      right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect)
    vi.spyOn(elB, 'getBoundingClientRect').mockReturnValue({
      left: 50, top: 50, width: 100, height: 100,
      right: 150, bottom: 150, x: 50, y: 50, toJSON: () => ({}),
    } as DOMRect)

    rafCallback(0)

    expect(onCollideA).toHaveBeenCalledOnce()
    expect(onCollideB).toHaveBeenCalledOnce()
    // Collider is in event.detail
    expect((onCollideA.mock.calls[0][0] as CustomEvent).detail).toBe(elB)
    expect((onCollideB.mock.calls[0][0] as CustomEvent).detail).toBe(elA)
  })

  it('dispatches non-collide-groupA reaching @non-collide-groupA when elements do not overlap', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    const onNonCollide = vi.fn()

    const wrapper = mount(
      {
        template: `
          <div>
            <div id="a" v-collision.prevent="['groupA']" @non-collide-groupA="onNonCollide" />
            <div id="b" v-collision.prevent="['groupA']" />
          </div>
        `,
        methods: { onNonCollide },
      },
      { global: { plugins: [VueCollision] } },
    )

    const elA = wrapper.find('#a').element as HTMLElement
    const elB = wrapper.find('#b').element as HTMLElement

    vi.spyOn(elA, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 100, height: 100,
      right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect)
    vi.spyOn(elB, 'getBoundingClientRect').mockReturnValue({
      left: 200, top: 200, width: 100, height: 100,
      right: 300, bottom: 300, x: 200, y: 200, toJSON: () => ({}),
    } as DOMRect)

    rafCallback(0)

    expect(onNonCollide).toHaveBeenCalledOnce()
  })

  it('removes elements from group on unmount; post-unmount rAF fires no events', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: VueCollision } = await import('../index')

    const onCollide = vi.fn()

    const wrapper = mount(
      {
        template: `
          <div>
            <div id="a" v-collision.prevent="['groupC']" @collide-groupC="onCollide" />
            <div id="b" v-collision.prevent="['groupC']" />
          </div>
        `,
        methods: { onCollide },
      },
      { global: { plugins: [VueCollision] } },
    )

    wrapper.unmount()

    // After unmount, group has no combinations; rAF fires nothing
    if (rafCallback) rafCallback(0)

    expect(onCollide).not.toHaveBeenCalled()
  })
})
