import { defineConfig } from '../../src/node'

export default defineConfig({
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  themeConfig: {
    nav: nav(),

    sidebar: {
      '/guide/': sidebarGuide(),
      '/config/': sidebarConfig()
    },

    editLink: {
      repo: 'vuejs/vitepress',
      branch: 'next',
      dir: 'docs',
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
    { text: 'Configs', link: '/config/introduction', activeMatch: '/config/' },
    {
      text: 'Release Notes',
      link: 'https://github.com/vuejs/vitepress/releases'
    }
  ]
}

function sidebarGuide() {
  return [
    {
      text: 'Introduction',
      items: [
        { text: 'What is VitePress?', link: '/guide/what-is-vitepress' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Configuration', link: '/guide/configuration' },
        { text: 'Asset Handling', link: '/guide/asset-handling' },
        { text: 'Markdown Extensions', link: '/guide/markdown-extensions' },
        { text: 'Frontmatter', link: '/guide/frontmatter' },
        { text: 'Using Vue in Markdown', link: '/guide/using-vue' },
        { text: 'API Reference', link: '/guide/api' },
        { text: 'Deploying', link: '/guide/deploying' }
      ]
    },
    {
      text: 'Theme',
      items: [
        { text: 'Introduction', link: '/guide/theme-introduction' },
        { text: 'Layout', link: '/guide/theme-layout' },
        { text: 'Homepage', link: '/guide/theme-homepage' },
        { text: 'Footer', link: '/guide/theme-footer' },
        { text: 'Carbon Ads', link: '/guide/theme-carbon-ads' }
      ]
    },
    {
      text: 'Migrations',
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
      text: 'Config',
      items: [
        { text: 'Introduction', link: '/config/introduction' },
        { text: 'App Configs', link: '/config/app-configs' },
        { text: 'Theme Configs', link: '/config/theme-configs' },
        { text: 'Frontmatter Configs', link: '/config/frontmatter-configs' }
      ]
    }
  ]
}
