module.exports = {
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  themeConfig: {
    repo: 'vuejs/vitepress',
    docsDir: 'docs',

    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    lastUpdated: 'Last Updated',

    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Config Reference', link: '/config/' },
      {
        text: 'Release Notes',
        link: 'https://github.com/vuejs/vitepress/releases'
      }
    ],

    sidebar: {
      '/': getGuideSidebar(),
      '/guide/': getGuideSidebar(),
      '/config/': getConfigSidebar()
    }
  }
}

function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        { text: 'What is VitePress?', link: '/' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Configuration', link: '/guide/configuration' },
        { text: 'Markdown Extensions', link: '/guide/markdown' },
        { text: 'Customization', link: '/guide/customization' },
        { text: 'Deploying', link: '/guide/deploy' }
      ]
    }
  ]
}

function getConfigSidebar() {
  return [{ text: 'Config Reference', link: '/config/' }]
}
