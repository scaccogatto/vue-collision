# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking changes

- **Vue 3.5 or later is required.** `peerDependencies.vue` is now `^3.5.0` (was `^3.0.0`). The plugin uses `app.onUnmount()` and the typed directive modifiers, both added in Vue 3.5.
- **Group events are edge-triggered.** `collide-<group>` / `non-collide-<group>` used to fire for every pair on every check (each mount, update, scroll and resize). Each pair now reports its initial state once, then only when its overlap state changes, as the README already described. Remove any manual de-duplication you added in handlers.

### Fixed

- `install()` no longer touches `window`, so `createSSRApp().use(VueCollision)` works under Node. Trigger listeners are attached on the first client-side mount.
- Global trigger listeners are removed on `app.unmount()`. They used to stay on `window` forever, keeping the unmounted app's state alive.
- Scrolling inside an inner scroll container (for example `overflow: auto`) now re-checks element groups: trigger listeners use the capture phase.
- CommonJS consumers get CJS types (`dist/index.d.cts`) through a per-condition `exports` map, instead of ESM-flavored types for `require`.
- The tarball no longer ships declaration maps that point at sources it does not include.

### Added

- `v-collision` is registered in Vue's `GlobalDirectives` interface, so `vue-tsc` checks its value and modifiers in templates.
- `CollisionDirective` and `CollisionModifiers` types.
- `homepage` (the live demo) and `bugs` fields in `package.json`, and `engines.node` `>=24`.
- README sections on edge-triggered group events and on the standalone `collisionDirective` export (no global triggers).

### Changed

- The plugin is typed as `Plugin<[CollisionOptions?]>`, so `app.use(VueCollision, options)` checks the options.
- The demo announces collision and viewport status changes to assistive technology.

### Security

- Dev dependency `brace-expansion` updated past GHSA-q2hr-2g5m-vwhr, GHSA-qhr7-859c-m2p7 and GHSA-6j4f-fj2g-mc7p (not shipped in the package).

## [2.0.2] - 2026-07-17

### Fixed

- **Per-app plugin state.** `install()` used to mutate module-scoped state (`customGroups`, `elementStates`, `globalTriggerListeners`), so concurrent `createApp()` instances could clobber each other's collision groups. State is now created fresh per `install()` call and closed over by that install's directive instance.
- Custom group entries are now deleted once their last element unmounts, instead of being kept around empty forever.

### Removed

- Dead internal window-group tracking (`windowGroup` array): it was written to but never read for any collision decision.

## [2.0.1] - 2026-06-28

### Changed

- Refreshed npm keywords. First release published from GitHub Actions with npm trusted publishing and provenance. No code changes.

## [2.0.0] - 2026-06-28

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

## [1.6.0] - 2018-03-09

Initial published release (Vue 2, Webpack 2, Mocha 3).

[Unreleased]: https://github.com/scaccogatto/vue-collision/compare/v2.0.2...HEAD
[2.0.2]: https://github.com/scaccogatto/vue-collision/compare/v2.0.0...v2.0.2
[2.0.1]: https://www.npmjs.com/package/vue-collision/v/2.0.1
[2.0.0]: https://github.com/scaccogatto/vue-collision/compare/v1.6.0...v2.0.0
[1.6.0]: https://github.com/scaccogatto/vue-collision/releases/tag/v1.6.0
