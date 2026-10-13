import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/index.ts'],
      // One declaration file per module format: index.d.ts for the ESM entry and
      // index.d.cts for the CJS entry, so `require` consumers get CJS-flavored types.
      outDirs: ['dist', { dir: 'dist', moduleFormat: 'cjs' }],
      // Library sources are pure TS. Without this, unplugin-dts finds
      // demo/App.vue while scanning the root and switches to the Vue
      // processor, which needs @vue/language-core.
      processor: 'ts',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `vue-collision.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
      },
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
})
