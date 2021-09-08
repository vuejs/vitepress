
import { defineConfig } from 'vite'
import vitepressPages from './plugin/vitepress-pages'

export default defineConfig({
  plugins: [
    vitepressPages(),
  ],
})
