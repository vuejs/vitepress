import { createRequire } from 'module'
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

  locales: locales.locales
})
