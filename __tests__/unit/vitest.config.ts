import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const dir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '@siteData', replacement: resolve(dir, './shims.ts') },
      { find: 'client', replacement: resolve(dir, '../../src/client') },
      { find: 'node', replacement: resolve(dir, '../../src/node') },
      {
        find: /^vitepress$/,
        replacement: resolve(dir, '../../src/client/index.js')
      },
      {
        find: /^vitepress\/theme$/,
        replacement: resolve(dir, '../../src/client/theme-default/index.js')
      }
    ]
  },
  test: {
    globals: true
  }
})
