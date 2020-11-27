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

    carbonAds: {
      carbon: 'CEBDT27Y',
      custom: 'CKYD62QM',
      placement: 'vuejsorg'
    },

    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Config Reference', link: '/config/basics' },
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
        { text: 'Asset Handling', link: '/guide/assets' },
        { text: 'Markdown Extensions', link: '/guide/markdown' },
        { text: 'Deploying', link: '/guide/deploy' }
      ]
    },
    {
      text: 'Advanced',
      children: [
        { text: 'Frontmatter', link: '/guide/frontmatter' },
        { text: 'Global Computed', link: '/guide/global-computed' },
        { text: 'Customization', link: '/guide/customization' }
      ]
    }
  ]
}

function getConfigSidebar() {
  return [
    {
      text: 'App Config',
      children: [
        { text: 'Basics', link: '/config/basics' },
        { text: 'Carbon Ads', link: '/config/carbon-ads' }
      ]
    },
    {
      text: 'Theme Config',
      children: [{ text: 'Homepage', link: '/config/homepage' }]
    }
  ]
}
