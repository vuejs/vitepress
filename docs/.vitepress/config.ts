import { defineConfig } from 'vitepress'
import locales from './locales'

export default defineConfig({
  title: 'VitePress',

  lastUpdated: true,
  cleanUrls: true,

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

  transformHead({ page }) {
    if (page === 'index.md') {
      return [
        ['link', { rel: 'preload', as: 'image', href: '/vue.svg' }],
        ['link', { rel: 'preload', as: 'image', href: '/vite.svg' }]
      ]
    }
  },

  markdown: {
    headers: {
      level: [0, 0]
    }
  },

  locales: locales.locales
})
