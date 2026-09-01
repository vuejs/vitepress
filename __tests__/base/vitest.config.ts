import { defineConfig } from 'vitest/config'

const timeout = 60_000

export default defineConfig({
  test: {
    globalSetup: ['vitestGlobalSetup.ts'],
    testTimeout: timeout,
    hookTimeout: timeout,
    teardownTimeout: timeout,
    globals: true,
    fileParallelism: false
  }
})
