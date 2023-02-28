import { createRequire } from 'module'
import { defineConfig } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export default defineConfig({
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  lastUpdated: true,
  cleanUrls: true,

  head: [['meta', { name: 'theme-color', content: '#3c8772' }]],

  markdown: {
    headers: {
      level: [0, 0]
    }
  },

  themeConfig: {
    nav: nav(),

    sidebar: {
      '/guide/': sidebarGuide(),
      '/config/': sidebarConfig(),
      '/api/': sidebarGuide()
    },

    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    },

    algolia: {
      appId: '8J64VVRP8K',
      apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
      indexName: 'vitepress'
    },

    carbonAds: {
      code: 'CEBDT27Y',
      placement: 'vuejsorg'
    }
  }
})

function nav() {
  return [
    { text: 'Guide', link: '/guide/what-is-vitepress', activeMatch: '/guide/' },
    {
      text: 'Config Reference',
      link: '/config/introduction',
      activeMatch: '/config/'
    },
    {
      text: 'Runtime API',
      link: '/api/',
      activeMatch: '/api/'
    },
    {
      text: pkg.version,
      items: [
        {
          text: 'Changelog',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: 'Contributing',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function sidebarGuide() {
  return [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        { text: 'What is VitePress?', link: '/guide/what-is-vitepress' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Configuration', link: '/guide/configuration' },
        { text: 'Routing', link: '/guide/routing' },
        { text: 'Deploying', link: '/guide/deploying' }
      ]
    },
    {
      text: 'Writing',
      collapsed: false,
      items: [
        { text: 'Markdown Extensions', link: '/guide/markdown' },
        { text: 'Asset Handling', link: '/guide/asset-handling' },
        { text: 'Frontmatter', link: '/guide/frontmatter' },
        { text: 'Using Vue in Markdown', link: '/guide/using-vue' },
        { text: 'Internationalization', link: '/guide/i18n' }
      ]
    },
    {
      text: 'Customization',
      collapsed: false,
      items: [
        { text: 'Default Theme', link: '/guide/default-theme' },
        {
          text: 'Extending the Default Theme',
          link: '/guide/customization-extending-default-theme'
        },
        { text: 'Building a Custom Theme', link: '/guide/customization-intro' },
        {
          text: 'Runtime API',
          link: '/api/'
        },
        { text: 'Build-Time Data Loading', link: '/guide/data-loading' }
      ]
    },
    {
      text: 'Migrations',
      collapsed: false,
      items: [
        {
          text: 'Migration from VuePress',
          link: '/guide/migration-from-vuepress'
        },
        {
          text: 'Migration from VitePress 0.x',
          link: '/guide/migration-from-vitepress-0'
        }
      ]
    }
  ]
}

function sidebarConfig() {
  return [
    {
      text: 'Config Reference',
      items: [
        { text: 'Introduction', link: '/config/introduction' },
        { text: 'App Config', link: '/config/app-config' },
        { text: 'Default Theme Config', link: '/config/theme-config' },
        { text: 'Frontmatter Config', link: '/config/frontmatter-config' }
      ]
    }
  ]
}
