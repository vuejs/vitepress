import { defineConfig } from 'vitest/config'

const timeout = 60_000

export default defineConfig({
  test: {
    setupFiles: ['vitestSetup.ts'],
    globalSetup: ['__tests__/e2e/vitestGlobalSetup.ts'],
    testTimeout: timeout,
    hookTimeout: timeout,
    teardownTimeout: timeout,
    globals: true
  }
})
