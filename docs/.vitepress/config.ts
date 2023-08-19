import { createRequire } from 'module'
import { defineConfig } from 'vitepress'
import locales from './locales'

export default defineConfig({
  title: 'VitePress',

  lastUpdated: true,
  cleanUrls: true,

  sitemap: {
    hostname: 'https://vitepress.dev',
    transformItems(items) {
      return items.filter((item) => !item.url.includes('migration'))
    }
  },

  head: [
    ['meta', { name: 'theme-color', content: '#3c8772' }],
    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'AZBRSFGG',
        'data-spa': 'auto',
        defer: ''
      }
    ]
  ],

  locales: locales.locales
})
