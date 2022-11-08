import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const dir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@siteData': resolve(dir, './shims.ts'),
      client: resolve(dir, '../../src/client'),
      node: resolve(dir, '../../src/node'),
      vitepress: resolve(dir, '../../src/client')
    }
  },
  test: {
    globals: true
  }
})
