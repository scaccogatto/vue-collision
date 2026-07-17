# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed

- **Per-app plugin state (SSR safety).** `install()` used to mutate module-scoped state (`customGroups`, `elementStates`, `globalTriggerListeners`), so concurrent `createApp()` instances (e.g. under SSR) could clobber each other's collision groups. State is now created fresh per `install()` call and closed over by that install's directive instance.
- Custom group entries are now deleted once their last element unmounts, instead of being kept around empty forever.

### Removed

- Dead internal window-group tracking (`windowGroup` array) — it was written to but never read for any collision decision.

## [2.0.0] — 2026-06-28

### Breaking changes

- **Vue 3 only.** The plugin and directive are fully rewritten for Vue 3. Vue 2 is no longer supported.
- **Events are now native DOM `CustomEvent`s.** In v1, `@collide` / `@non-collide` received the collider as a bare argument. In v2 the handlers receive a `CustomEvent`; the collider is available on `event.detail`.
  ```js
  // v1
  onCollide(collider) { … }

  // v2
  onCollide(event) { const collider = event.detail }
  ```
- **`v-collision` is now a plain-element directive.** The directive must be applied to a host HTML element, not a Vue component root — use the native element (`<div v-collision>`) or pass through `v-bind="$attrs"` in a wrapper component.
- **`globalTriggers` still supported.** Options shape is unchanged: `app.use(VueCollision, { globalTriggers: ['resize', 'scroll'] })`.
- **Group events** are `collide-<groupName>` / `non-collide-<groupName>` on native DOM `CustomEvent`s (same naming, different delivery mechanism).

### New features

- **Viewport collision** now uses `IntersectionObserver` (zero-cost, edge-triggered) instead of rAF polling. Fires immediately on mount when the element is already visible.
- **Element-element group collision** retains rAF + AABB for arbitrary element pair checks (IntersectionObserver cannot cover this).
- **TypeScript** — fully typed source with `.d.ts` declarations shipped in `dist/`.
- **Vite library mode build** — ships ESM (`dist/vue-collision.js`) + CJS (`dist/vue-collision.cjs`) with proper `exports` map and `types` field.
- **CI** — GitHub Actions on Node 20 LTS (install → typecheck → build → test).

### Bug fixes (inherited from 1.6.0 source)

- Fixed comma-as-dot typos on lines 64 and 104 (`VueCollision,_removeVnodeFromGroup` → proper method call).
- Fixed undeclared variable `customGroup` used where `updateGroup` was intended (updated hook, lines 77–82).
- Fixed `lenght` → `length` (three occurrences, line 81).
- Fixed `oldVNode` capital-N casing mismatch (line 98).
- Fixed `binding.oldValue.value` → `binding.value` (line 95).
- Removed `custom-event-polyfill` (unnecessary since 2017; was the root cause of **issue #1** — `window` access at require-time before jsdom setup). Resolves [#1](https://github.com/scaccogatto/vue-collision/issues/1).
- Removed `js-combinatorics` (API-breaking 0.5→2.x); replaced inline with a 2-line pure function.
- Removed `vue-throttle-event` (dormant dependency); global triggers use native passive `addEventListener`.

## [1.6.0] — 2017-xx-xx

Initial published release (Vue 2, Webpack 2, Mocha 3).
