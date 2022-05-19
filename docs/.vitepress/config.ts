import { defineConfig } from '../../src/node'

export default defineConfig({
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/what-is-vitepress' },
      { text: 'Configs', link: '/config/app-configs' },
      {
        text: 'Release Notes',
        link: 'https://github.com/vuejs/vitepress/releases'
      }
    ],

    sidebar: {
      '/guide/': getGuideSidebar(),
      '/config/': getConfigSidebar(),
      '/': getGuideSidebar()
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

    algolia: {
      appId: '8J64VVRP8K',
      apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
      indexName: 'vitepress'
    }
  }
})

function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      items: [{ text: 'What is VitePress?', link: '/guide/what-is-vitepress' }]
    }
  ]
}

function getConfigSidebar() {
  return [
    {
      text: 'Config',
      items: [
        { text: 'App Configs', link: '/config/app-configs' },
        { text: 'Theme Configs', link: '/config/theme-configs' }
      ]
    }
  ]
}
