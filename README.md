# vue-collision

> Vue 3 directive that fires `collide` / `non-collide` events when an element enters or leaves the viewport, plus element-to-element group collision detection via AABB.

[![CI](https://github.com/scaccogatto/vue-collision/actions/workflows/ci.yml/badge.svg)](https://github.com/scaccogatto/vue-collision/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/vue-collision.svg)](https://www.npmjs.com/package/vue-collision)
[![npm downloads](https://img.shields.io/npm/dm/vue-collision)](https://www.npmjs.com/package/vue-collision)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- **Viewport collision** via [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) — zero-cost, edge-triggered
- **Element-to-element group collision** via rAF + AABB overlap — groups any number of elements and checks every pair
- Fires native DOM `CustomEvent`s (`collide`, `non-collide`, `collide-<group>`, `non-collide-<group>`)
- Grouping: place elements in named groups; any pair within a group is checked
- `.prevent` modifier to opt out of viewport tracking
- TypeScript source with `.d.ts` declarations
- Vue 3 only (v2.x); for Vue 2 use [v1.x](https://www.npmjs.com/package/vue-collision/v/1.6.0)

## Install

```sh
npm install vue-collision
```

## Quick start

### main.ts

```ts
import { createApp } from 'vue'
import VueCollision from 'vue-collision'
import App from './App.vue'

createApp(App)
  .use(VueCollision, { globalTriggers: ['resize', 'scroll'] })
  .mount('#app')
```

### Component (`<script setup>`)

```vue
<script setup lang="ts">
const onCollide = (e: CustomEvent) => {
  // e.detail is `window` for viewport events
  console.log('in viewport', e.detail)
}
const onLeave = (e: CustomEvent) => {
  console.log('left viewport')
}
const onGroupCollide = (e: CustomEvent<HTMLElement>) => {
  // e.detail is the other element this element collided with
  console.log('collided with', e.detail)
}
</script>

<template>
  <!-- tracks viewport + 'groupA' element collisions -->
  <div
    v-collision="['groupA']"
    @collide="onCollide"
    @non-collide="onLeave"
    @collide-groupA="onGroupCollide"
    @non-collide-groupA="onGroupCollide"
  />

  <!-- viewport only (no custom group) -->
  <div v-collision @collide="onCollide" @non-collide="onLeave" />

  <!-- groupA only, skip viewport tracking -->
  <div
    v-collision.prevent="['groupA']"
    @collide-groupA="onGroupCollide"
  />
</template>
```

## Directive reference

| Syntax | Behaviour |
|--------|-----------|
| `v-collision` | Viewport group + IntersectionObserver |
| `v-collision.prevent` | Opt out of viewport group |
| `v-collision="['g1', 'g2']"` | Add to named groups (`g1`, `g2`) |
| `v-collision.prevent="['g1']"` | Named groups only, no viewport tracking |

## Events

All events are native DOM `CustomEvent`s. Read the collider from `event.detail`.

| Event | Fires when | `event.detail` |
|-------|-----------|----------------|
| `collide` | Element enters the viewport | `window` |
| `non-collide` | Element leaves the viewport | `window` |
| `collide-<group>` | Element overlaps another in the same group | The other `HTMLElement` |
| `non-collide-<group>` | Element stops overlapping another in the same group | The other `HTMLElement` |

## Plugin options

```ts
app.use(VueCollision, {
  // Events that trigger element-group re-checks. Default: ['resize', 'scroll']
  globalTriggers: ['resize', 'scroll'],
})
```

## Migrating from v1 (Vue 2 → Vue 3)

v2.0.0 is a full Vue 3 rewrite. Key breaking changes:

1. **Install** — replace `Vue.use(...)` with `app.use(...)`.

2. **Event delivery** — events are now native DOM `CustomEvent`s, not Vue component events. The collider is on `event.detail`, not the first argument:

   ```js
   // v1 (Vue 2)
   onCollide(collider) { /* collider was the Vue instance */ }

   // v2 (Vue 3)
   onCollide(event) { const collider = event.detail }
   ```

3. **Listen with `@` on a plain element** — `v-collision` must be placed on a host element (`<div>`, `<section>`, etc.) not a component root. If your component exposes its root element, use `v-bind="$attrs"` to forward the listeners.

4. **Viewport detection** — now uses `IntersectionObserver` instead of `requestAnimationFrame` polling (lower CPU, fires immediately).

5. **Element-group re-check timing** — element-group collision is checked once per frame-request, triggered by mount, `updated`, and the configured `globalTriggers` (default: `resize`, `scroll`). Pure CSS transforms or animations that move elements without triggering a scroll, resize, or Vue reactive update will not automatically re-check. Add a global trigger event or call `window.dispatchEvent(new Event('resize'))` to force a re-check if needed.

## Development

```sh
npm install
npm run typecheck
npm run build
npm test
```

## License

MIT
