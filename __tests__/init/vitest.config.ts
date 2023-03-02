import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const dir = dirname(fileURLToPath(import.meta.url))

const timeout = 60_000

export default defineConfig({
  resolve: {
    alias: {
      node: resolve(dir, '../../src/node')
    }
  },
  test: {
    watchExclude: ['**/node_modules/**', '**/temp/**'],
    globalSetup: ['__tests__/init/vitestGlobalSetup.ts'],
    testTimeout: timeout,
    hookTimeout: timeout,
    teardownTimeout: timeout,
    globals: true
  }
})
