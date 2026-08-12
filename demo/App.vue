<script setup lang="ts">
import { ref } from 'vue'

const offset = ref(0)
const overlapping = ref(false)
const inViewport = ref(false)
const log = ref<string[]>([])

const push = (line: string) => {
  log.value = [line, ...log.value].slice(0, 6)
}

// Element-element group: `detail` is the other element of the pair.
const onGroupCollide = (event: Event) => {
  if (overlapping.value) return
  overlapping.value = true
  const other = (event as CustomEvent<HTMLElement>).detail
  push(`collide-boxes with "${other.textContent?.trim()}"`)
}

const onGroupLeave = () => {
  if (!overlapping.value) return
  overlapping.value = false
  push('non-collide-boxes')
}

// Viewport group: `detail` is `window`.
const onViewport = (event: Event) => {
  inViewport.value = (event as CustomEvent).detail === window
  push('collide (viewport)')
}

const onViewportLeave = () => {
  inViewport.value = false
  push('non-collide (viewport)')
}
</script>

<template>
  <main>
    <h1>vue-collision</h1>
    <p class="lede">
      One directive, two kinds of collision. Drag the slider to push the moving
      box into the static one: that is a named group, checked with AABB overlap
      on <code>requestAnimationFrame</code>. Scroll to the card further down: that
      is the viewport group, backed by <code>IntersectionObserver</code>.
    </p>

    <div class="stage">
      <div
        v-collision.prevent="['boxes']"
        class="box static"
        @collide-boxes="onGroupCollide"
        @non-collide-boxes="onGroupLeave"
      >
        static
      </div>
      <div
        v-collision.prevent="['boxes']"
        class="box moving"
        :class="{ hit: overlapping }"
        :style="{ left: `${offset}%` }"
        @collide-boxes="onGroupCollide"
        @non-collide-boxes="onGroupLeave"
      >
        moving
      </div>
    </div>

    <label class="slider">
      <span class="label">offset</span>
      <input v-model.number="offset" type="range" min="0" max="100" />
      <code>{{ offset }}%</code>
    </label>

    <p class="verdict">
      <code>v-collision="['boxes']"</code> →
      <strong :class="{ on: overlapping }">
        {{ overlapping ? 'colliding' : 'apart' }}
      </strong>
    </p>

    <h2>Event log</h2>
    <ul class="log">
      <li v-for="(line, i) in log" :key="`${line}-${i}`"><code>{{ line }}</code></li>
      <li v-if="!log.length" class="muted">Nothing yet.</li>
    </ul>

    <div class="spacer">scroll down</div>

    <div
      v-collision
      class="card"
      :class="{ on: inViewport }"
      @collide="onViewport"
      @non-collide="onViewportLeave"
    >
      <span class="label">viewport group</span>
      <strong>{{ inViewport ? 'in viewport' : 'out of viewport' }}</strong>
    </div>
  </main>
</template>

<style scoped>
.stage {
  position: relative;
  height: 8rem;
  margin-bottom: 1rem;
  border: 1px dashed var(--line);
  border-radius: 0.5rem;
}

.box {
  position: absolute;
  top: 50%;
  width: 6rem;
  height: 3.5rem;
  margin-top: -1.75rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 0.4rem;
  font-family: var(--mono);
  font-size: 0.8rem;
}

.static {
  left: calc(50% - 3rem);
  background: color-mix(in srgb, var(--fg) 6%, transparent);
}

.moving {
  transition: border-color 0.15s;
}

.moving.hit {
  border-color: var(--accent);
  color: var(--accent);
}

.slider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.slider input {
  flex: 1;
}

.verdict strong {
  font-family: var(--mono);
}

.verdict strong.on {
  color: var(--accent);
}

.log {
  margin: 0;
  padding-left: 1.25rem;
}

.spacer {
  height: 70vh;
  display: grid;
  place-items: center;
  color: var(--muted);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 2rem 1.25rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  transition: border-color 0.2s;
}

.card.on {
  border-color: var(--accent);
}

.card strong {
  font-family: var(--mono);
  font-size: 1.25rem;
}

.card.on strong {
  color: var(--accent);
}

.muted {
  color: var(--muted);
}
</style>
