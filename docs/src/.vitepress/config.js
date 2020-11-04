module.exports = {
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  themeConfig: {
    repo: 'vuejs/vitepress',
    docsDir: 'docs',
    editLinkText: 'Edit this page on GitHub',

    nav: [
      { text: 'Guide', link: '/guide/what-is-vitepress' },
      {
        text: 'Release Notes',
        link: 'https://github.com/vuejs/vitepress/releases'
      }
    ],

    sidebar: [
      {
        text: 'Introduction',
        children: [
          { text: 'What is VitePress?', link: '/guide/what-is-vitepress' }
        ]
      }
    ]
  }
}
