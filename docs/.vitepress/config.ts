import { defineConfig } from 'vitepress'
import locales from './locales'

export default defineConfig({
  title: 'VitePress',

  lastUpdated: true,
  cleanUrls: true,

  head: [['meta', { name: 'theme-color', content: '#3c8772' }]],

  markdown: {
    headers: {
      level: [0, 0]
    }
  },

  locales: locales.locales
})
