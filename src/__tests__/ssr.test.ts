// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createSSRApp, h, resolveDirective, withDirectives } from 'vue'
import { renderToString } from 'vue/server-renderer'
import VueCollision from '../index'

describe('server-side rendering', () => {
  it('installs and renders without a window global', async () => {
    // DISCRIMINATING: install() used to call window.addEventListener, which throws
    // "window is not defined" under Node.
    expect(typeof window).toBe('undefined')

    const app = createSSRApp({
      render: () => withDirectives(h('div', { id: 'el' }), [[resolveDirective('collision')!, ['g']]]),
    })

    expect(() => app.use(VueCollision)).not.toThrow()
    await expect(renderToString(app)).resolves.toBe('<div id="el"></div>')
  })
})
