import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      node: path.resolve(__dirname, '../src/node'),
      client: path.resolve(__dirname, '../src/client')
    }
  },
  test: {
    globals: true
  }
})
