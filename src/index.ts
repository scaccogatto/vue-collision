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
// Plugin state — one instance per install() call (SSR-safe, no module-scope mutation)
// ---------------------------------------------------------------------------

interface PluginState {
  customGroups: Record<string, CollisionGroupState>
  globalTriggerListeners: Array<[string, () => void]>
  elementStates: WeakMap<HTMLElement, CollisionElementState>
}

const createPluginState = (): PluginState => ({
  customGroups: {},
  globalTriggerListeners: [],
  elementStates: new WeakMap(),
})

// ---------------------------------------------------------------------------
// Viewport detection via IntersectionObserver (fires once, edge-triggered)
// ---------------------------------------------------------------------------

// elState is always defined here — the only caller (mounted) just created it.
const observeViewport = (el: HTMLElement, elState: CollisionElementState): void => {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const event = entry.isIntersecting ? 'collide' : 'non-collide'
      el.dispatchEvent(new CustomEvent(event, { detail: window, bubbles: false }))
    }
  })

  observer.observe(el)
  elState.ioObserver = observer
}

const unobserveViewport = (state: PluginState, el: HTMLElement): void => {
  const elState = state.elementStates.get(el)
  elState?.ioObserver?.disconnect()
}

// ---------------------------------------------------------------------------
// Element-element collision via rAF (AABB, arbitrary element pairs)
// ---------------------------------------------------------------------------

const checkElementGroup = (state: PluginState, groupName: string): void => {
  const group = state.customGroups[groupName]
  if (!group) return
  // Vue 3.5's template compiler uses the `on:event-name` prop format for DOM elements,
  // which preserves the event name verbatim (parseName strips `on:` and keeps the rest).
  // So `@collide-groupA` registers a DOM listener for exactly `collide-groupA` —
  // dispatch the same string the user passed as the group name.
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

const scheduleGroupRaf = (state: PluginState, groupName: string): void => {
  const group = state.customGroups[groupName]
  if (!group || group.rafId != null) return
  group.rafId = window.requestAnimationFrame(() => {
    group.rafId = undefined
    checkElementGroup(state, groupName)
  })
}

const checkAllElementGroups = (state: PluginState): void => {
  for (const name of Object.keys(state.customGroups)) scheduleGroupRaf(state, name)
}

// ---------------------------------------------------------------------------
// Group management helpers
// ---------------------------------------------------------------------------

const pushToGroup = (state: PluginState, el: HTMLElement, groupName: string): void => {
  if (!state.customGroups[groupName]) {
    state.customGroups[groupName] = { elements: [], combinations: [] }
  }
  const group = state.customGroups[groupName]
  if (!group.elements.includes(el)) {
    group.elements.push(el)
    group.combinations = combine(group.elements)
  }
}

const removeFromGroup = (state: PluginState, el: HTMLElement, groupName: string): void => {
  const group = state.customGroups[groupName]
  if (!group) return
  group.elements = group.elements.filter((e) => e !== el)
  if (group.elements.length === 0) {
    delete state.customGroups[groupName]
    return
  }
  group.combinations = combine(group.elements)
}

// ---------------------------------------------------------------------------
// Directive implementation — created per-install, closes over that install's state
// ---------------------------------------------------------------------------

const createDirective = (
  state: PluginState,
): ObjectDirective<HTMLElement, string[] | undefined> => ({
  mounted(el: HTMLElement, binding: DirectiveBinding<string[] | undefined>) {
    const groups = Array.isArray(binding.value) ? binding.value : []
    const inWindowGroup = !binding.modifiers['prevent']
    const elState: CollisionElementState = { inWindowGroup, groups }

    state.elementStates.set(el, elState)

    if (inWindowGroup) observeViewport(el, elState)

    for (const g of groups) {
      pushToGroup(state, el, g)
      scheduleGroupRaf(state, g)
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding<string[] | undefined>) {
    const elState = state.elementStates.get(el)
    if (!elState) return

    const prevGroups = elState.groups
    const nextGroups = Array.isArray(binding.value) ? binding.value : []

    const removed = prevGroups.filter((g) => !nextGroups.includes(g))
    const added = nextGroups.filter((g) => !prevGroups.includes(g))
    const kept = nextGroups.filter((g) => prevGroups.includes(g))

    for (const g of removed) removeFromGroup(state, el, g)
    for (const g of added) {
      pushToGroup(state, el, g)
      scheduleGroupRaf(state, g)
    }
    for (const g of kept) scheduleGroupRaf(state, g)

    elState.groups = nextGroups
  },

  unmounted(el: HTMLElement) {
    const elState = state.elementStates.get(el)
    if (!elState) return

    if (elState.inWindowGroup) unobserveViewport(state, el)

    for (const g of elState.groups) removeFromGroup(state, el, g)

    state.elementStates.delete(el)
  },
})

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

const VueCollision: Plugin = {
  install(app: App, options: CollisionOptions = {}) {
    const triggers = options.globalTriggers ?? ['resize', 'scroll']
    const state = createPluginState()

    for (const event of triggers) {
      const listener = () => checkAllElementGroups(state)
      window.addEventListener(event, listener, { passive: true })
      state.globalTriggerListeners.push([event, listener])
    }

    app.directive('collision', createDirective(state))
  },
}

export default VueCollision

// ---------------------------------------------------------------------------
// Convenience re-exports for tree-shaking and testing
// ---------------------------------------------------------------------------
export const collisionDirective = createDirective(createPluginState())
