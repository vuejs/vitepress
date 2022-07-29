import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

const timeout = process.env.CI ? 50000 : 30000

export default defineConfig({
  resolve: {
    alias: {
      '~utils': resolve(__dirname, './examples/test-utils')
    }
  },
  test: {
    include: ['./examples/**/*.spec.[tj]s'],
    setupFiles: ['./examples/vitestSetup.ts'],
    globalSetup: ['./examples/vitestGlobalSetup.ts'],
    testTimeout: timeout,
    hookTimeout: timeout,
    globals: true,
    reporters: 'dot',
    onConsoleLog(log) {
      if (log.match(/experimental|jit engine|emitted file|tailwind/i))
        return false
    }
  },
  esbuild: {
    target: 'node14'
  }
})
