module.exports = {
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  themeConfig: {
    repo: 'vuejs/vitepress',
    docsDir: 'docs',
    editLinkText: 'Edit this page on GitHub',

    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Config Reference', link: '/config/' },
      {
        text: 'Release Notes',
        link: 'https://github.com/vuejs/vitepress/releases'
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          children: [
            { text: 'What is VitePress?', link: '/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Customization', link: '/guide/customization' },
            { text: 'Deploying', link: '/guide/deploy' }
          ]
        }
      ],
      '/config/': [{ text: 'Config Reference', link: '/config/' }]
    }
  }
}
