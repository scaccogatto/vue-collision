// Type-level tests, checked by `npm run typecheck` (tsc --noEmit over src).
import { createApp } from 'vue'
import type { GlobalDirectives } from 'vue'
import VueCollision from '../index'
import type { CollisionDirective } from '../index'

const app = createApp({})

app.use(VueCollision)
app.use(VueCollision, { globalTriggers: ['resize'] })
// @ts-expect-error globalTriggers must be a string array
app.use(VueCollision, { globalTriggers: 1 })

// v-collision is registered globally, so vue-tsc checks its value in templates.
export const registered: CollisionDirective = ({} as GlobalDirectives).vCollision
