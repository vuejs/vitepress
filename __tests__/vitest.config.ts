import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const dir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      node: resolve(dir, '../src/node'),
      client: resolve(dir, '../src/client')
    }
  },
  test: {
    globals: true
  }
})
