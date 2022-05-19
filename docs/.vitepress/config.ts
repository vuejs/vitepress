import { defineConfig } from '../../src/node'

export default defineConfig({
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  // TODO: Do something about this.
  head: [
    [
      'script',
      {},
      `
        ;(() => {
          const saved = localStorage.getItem('vitepress-theme-appearance')
          const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches

          if (!saved || saved === 'auto' ? prefereDark : saved === 'dark') {
            document.documentElement.classList.add('dark')
          }
        })()
      `
    ]
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/what-is-vitepress' },
      { text: 'Config', link: '/config/app-basics' },
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
      text: 'App Config',
      items: [{ text: 'Basics', link: '/config/app-basics' }]
    }
  ]
}
