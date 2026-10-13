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
  /** Last reported overlap per pair, keyed by the pair's first then second element */
  overlaps: Map<HTMLElement, Map<HTMLElement, boolean>>
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

/** Modifiers accepted by `v-collision` */
export type CollisionModifiers = 'prevent'

/** Type of the `v-collision` directive: binds to an HTML element, takes an optional list of group names */
export type CollisionDirective = ObjectDirective<HTMLElement, string[] | undefined, CollisionModifiers>

declare module 'vue' {
  interface GlobalDirectives {
    vCollision: CollisionDirective
  }
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
  globalTriggers: readonly string[]
  globalTriggerListeners: Array<[string, () => void]>
  elementStates: WeakMap<HTMLElement, CollisionElementState>
}

const DEFAULT_GLOBAL_TRIGGERS: readonly string[] = ['resize', 'scroll']

const createPluginState = (globalTriggers: readonly string[]): PluginState => ({
  customGroups: {},
  globalTriggers,
  globalTriggerListeners: [],
  elementStates: new WeakMap(),
})

// Capture phase, so scroll events from inner scroll containers (which do not bubble)
// still reach the window listener.
const TRIGGER_LISTENER_OPTIONS: AddEventListenerOptions = { passive: true, capture: true }

// Listeners are attached lazily from the first directive `mounted` hook, which only runs
// in the browser: install() itself never touches `window`, so it is safe under SSR.
const startGlobalTriggers = (state: PluginState): void => {
  if (state.globalTriggerListeners.length > 0) return
  state.globalTriggerListeners = state.globalTriggers.map((event) => {
    const listener = () => checkAllElementGroups(state)
    window.addEventListener(event, listener, TRIGGER_LISTENER_OPTIONS)
    return [event, listener]
  })
}

const stopGlobalTriggers = (state: PluginState): void => {
  for (const [event, listener] of state.globalTriggerListeners) {
    window.removeEventListener(event, listener, TRIGGER_LISTENER_OPTIONS)
  }
  state.globalTriggerListeners = []
}

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
  // So `@collide-groupA` registers a DOM listener for exactly `collide-groupA`:
  // dispatch the same string the user passed as the group name.
  //
  // Edge-triggered: each pair reports its initial state once, then only transitions.
  for (const [a, b] of group.combinations) {
    const colliding = checkCollision(a.getBoundingClientRect(), b.getBoundingClientRect())
    const overlapsOfA = group.overlaps.get(a) ?? new Map<HTMLElement, boolean>()
    if (overlapsOfA.get(b) === colliding) continue
    overlapsOfA.set(b, colliding)
    group.overlaps.set(a, overlapsOfA)

    const event = `${colliding ? 'collide' : 'non-collide'}-${groupName}`
    a.dispatchEvent(new CustomEvent(event, { detail: b, bubbles: false }))
    b.dispatchEvent(new CustomEvent(event, { detail: a, bubbles: false }))
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
    state.customGroups[groupName] = { elements: [], combinations: [], overlaps: new Map() }
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
  // Forget the pair states of the leaving element, so it reports afresh if it rejoins.
  group.overlaps.delete(el)
  for (const overlapsOfOther of group.overlaps.values()) overlapsOfOther.delete(el)
  if (group.elements.length === 0) {
    delete state.customGroups[groupName]
    return
  }
  group.combinations = combine(group.elements)
}

// ---------------------------------------------------------------------------
// Directive implementation — created per-install, closes over that install's state
// ---------------------------------------------------------------------------

type CollisionBinding = DirectiveBinding<string[] | undefined, CollisionModifiers>

const createDirective = (state: PluginState): CollisionDirective => ({
  mounted(el: HTMLElement, binding: CollisionBinding) {
    const groups = Array.isArray(binding.value) ? binding.value : []
    const inWindowGroup = !binding.modifiers.prevent
    const elState: CollisionElementState = { inWindowGroup, groups }

    state.elementStates.set(el, elState)
    startGlobalTriggers(state)

    if (inWindowGroup) observeViewport(el, elState)

    for (const g of groups) {
      pushToGroup(state, el, g)
      scheduleGroupRaf(state, g)
    }
  },

  updated(el: HTMLElement, binding: CollisionBinding) {
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

const VueCollision: Plugin<[CollisionOptions?]> = {
  install(app: App, options: CollisionOptions = {}) {
    const state = createPluginState(options.globalTriggers ?? DEFAULT_GLOBAL_TRIGGERS)

    app.directive('collision', createDirective(state))
    app.onUnmount(() => stopGlobalTriggers(state))
  },
}

export default VueCollision

// ---------------------------------------------------------------------------
// Convenience re-exports for tree-shaking and testing
// ---------------------------------------------------------------------------
/**
 * Standalone directive for local registration (`directives: { collision: collisionDirective }`).
 * It has no global triggers: element groups are only re-checked on mount and update, never on
 * resize or scroll. Prefer `app.use(VueCollision)` unless you need local registration.
 */
export const collisionDirective: CollisionDirective = createDirective(createPluginState([]))
