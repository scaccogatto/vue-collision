import type { App, DirectiveBinding, ObjectDirective, Plugin } from 'vue'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

export interface CollisionGroupState {
  elements: HTMLElement[]
  combinations: [HTMLElement, HTMLElement][]
  rafId?: number
}

interface CollisionElementState {
  inWindowGroup: boolean
  groups: string[]
  ioObserver?: IntersectionObserver
  rafId?: number
}

export interface CollisionOptions {
  /** DOM events that trigger re-check of all element-element groups. Default: ['resize', 'scroll'] */
  globalTriggers?: string[]
}

// ---------------------------------------------------------------------------
// Pure utilities (exported for testing)
// ---------------------------------------------------------------------------

/** AABB overlap test */
export const checkCollision = (r1: Rect, r2: Rect): boolean =>
  r1.left < r2.left + r2.width &&
  r1.left + r1.width > r2.left &&
  r1.top < r2.top + r2.height &&
  r1.top + r1.height > r2.top

/** Generate all 2-element combinations of an array (no repeats) */
export const combine = <T>(xs: T[]): [T, T][] =>
  xs.flatMap((a, i) => xs.slice(i + 1).map((b) => [a, b] as [T, T]))

// ---------------------------------------------------------------------------
// Plugin-level state (reset on each install for SSR safety)
// ---------------------------------------------------------------------------

let windowGroup: HTMLElement[] = []
let customGroups: Record<string, CollisionGroupState> = {}
let globalTriggerListeners: Array<[string, () => void]> = []
const elementStates = new WeakMap<HTMLElement, CollisionElementState>()

// ---------------------------------------------------------------------------
// Viewport detection via IntersectionObserver (fires once, edge-triggered)
// ---------------------------------------------------------------------------

const observeViewport = (el: HTMLElement): void => {
  const state = elementStates.get(el)
  if (!state) return

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const event = entry.isIntersecting ? 'collide' : 'non-collide'
      el.dispatchEvent(new CustomEvent(event, { detail: window, bubbles: false }))
    }
  })

  observer.observe(el)
  state.ioObserver = observer
}

const unobserveViewport = (el: HTMLElement): void => {
  const state = elementStates.get(el)
  state?.ioObserver?.disconnect()
}

// ---------------------------------------------------------------------------
// Element-element collision via rAF (AABB, arbitrary element pairs)
// ---------------------------------------------------------------------------

const checkElementGroup = (groupName: string): void => {
  const group = customGroups[groupName]
  if (!group) return
  for (const [a, b] of group.combinations) {
    const ra = a.getBoundingClientRect()
    const rb = b.getBoundingClientRect()
    if (checkCollision(ra, rb)) {
      a.dispatchEvent(new CustomEvent(`collide-${groupName}`, { detail: b, bubbles: false }))
      b.dispatchEvent(new CustomEvent(`collide-${groupName}`, { detail: a, bubbles: false }))
    } else {
      a.dispatchEvent(new CustomEvent(`non-collide-${groupName}`, { detail: b, bubbles: false }))
      b.dispatchEvent(new CustomEvent(`non-collide-${groupName}`, { detail: a, bubbles: false }))
    }
  }
}

const scheduleGroupRaf = (groupName: string): void => {
  const group = customGroups[groupName]
  if (!group || group.rafId != null) return
  group.rafId = window.requestAnimationFrame(() => {
    group.rafId = undefined
    checkElementGroup(groupName)
  })
}

const checkAllElementGroups = (): void => {
  for (const name of Object.keys(customGroups)) scheduleGroupRaf(name)
}

// ---------------------------------------------------------------------------
// Group management helpers
// ---------------------------------------------------------------------------

const pushToGroup = (el: HTMLElement, groupName: string): void => {
  if (!customGroups[groupName]) {
    customGroups[groupName] = { elements: [], combinations: [] }
  }
  const group = customGroups[groupName]
  if (!group.elements.includes(el)) {
    group.elements.push(el)
    group.combinations = combine(group.elements)
  }
}

const removeFromGroup = (el: HTMLElement, groupName: string): void => {
  const group = customGroups[groupName]
  if (!group) return
  group.elements = group.elements.filter((e) => e !== el)
  group.combinations = combine(group.elements)
}

// ---------------------------------------------------------------------------
// Directive implementation
// ---------------------------------------------------------------------------

const directive: ObjectDirective<HTMLElement, string[] | undefined> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string[] | undefined>) {
    const groups = Array.isArray(binding.value) ? binding.value : []
    const inWindowGroup = !binding.modifiers['prevent']

    elementStates.set(el, { inWindowGroup, groups })

    if (inWindowGroup) {
      windowGroup.push(el)
      observeViewport(el)
    }

    for (const g of groups) {
      pushToGroup(el, g)
      scheduleGroupRaf(g)
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding<string[] | undefined>) {
    const state = elementStates.get(el)
    if (!state) return

    const prevGroups = state.groups
    const nextGroups = Array.isArray(binding.value) ? binding.value : []

    const removed = prevGroups.filter((g) => !nextGroups.includes(g))
    const added = nextGroups.filter((g) => !prevGroups.includes(g))
    const kept = nextGroups.filter((g) => prevGroups.includes(g))

    for (const g of removed) removeFromGroup(el, g)
    for (const g of added) {
      pushToGroup(el, g)
      scheduleGroupRaf(g)
    }
    for (const g of kept) scheduleGroupRaf(g)

    state.groups = nextGroups
  },

  unmounted(el: HTMLElement, binding: DirectiveBinding<string[] | undefined>) {
    const state = elementStates.get(el)
    if (!state) return

    if (state.inWindowGroup) {
      windowGroup = windowGroup.filter((e) => e !== el)
      unobserveViewport(el)
    }

    for (const g of state.groups) removeFromGroup(el, g)

    elementStates.delete(el)
  },
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

const VueCollision: Plugin = {
  install(app: App, options: CollisionOptions = {}) {
    const triggers = options.globalTriggers ?? ['resize', 'scroll']

    // Reset plugin state (important for SSR / multiple installs)
    windowGroup = []
    customGroups = {}

    // Tear down previous global listeners if plugin re-installed
    for (const [event, listener] of globalTriggerListeners) {
      window.removeEventListener(event, listener)
    }
    globalTriggerListeners = []

    for (const event of triggers) {
      const listener = () => checkAllElementGroups()
      window.addEventListener(event, listener, { passive: true })
      globalTriggerListeners.push([event, listener])
    }

    app.directive('collision', directive)
  },
}

export default VueCollision

// ---------------------------------------------------------------------------
// Convenience re-exports for tree-shaking and testing
// ---------------------------------------------------------------------------
export { directive as collisionDirective }

// In-browser CDN auto-install
if (typeof window !== 'undefined' && 'Vue' in window) {
  ;(window as unknown as Record<string, { use: (p: Plugin) => void }>)['Vue'].use(VueCollision)
}
