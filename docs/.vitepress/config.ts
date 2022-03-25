import { defineConfig, HeadConfig, PageData } from '../../src/node'

const lang = 'en-US';
const title = 'VitePress';
const description = 'Vite & Vue powered static site generator.';

export default defineConfig({
  lang,
  title,
  description,
  lastUpdated: true,

  head: getHead,

  themeConfig: {
    repo: 'vuejs/vitepress',
    docsDir: 'docs',
    docsBranch: 'main',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    lastUpdated: 'Last Updated',

    algolia: {
      appId: '8J64VVRP8K',
      apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
      indexName: 'vitepress'
    },

    carbonAds: {
      carbon: 'CEBDT27Y',
      custom: 'CKYD62QM',
      placement: 'vuejsorg'
    },

    nav: [
      { text: 'Guide', link: '/', activeMatch: '^/$|^/guide/' },
      {
        text: 'Config Reference',
        link: '/config/basics',
        activeMatch: '^/config/'
      },
      {
        text: 'Release Notes',
        link: 'https://github.com/vuejs/vitepress/releases'
      }
    ],

    sidebar: {
      '/guide/': getGuideSidebar(),
      '/config/': getConfigSidebar(),
      '/': getGuideSidebar()
    }
  }
})

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
        { text: 'Using Vue in Markdown', link: '/guide/using-vue' },
        { text: 'Deploying', link: '/guide/deploy' }
      ]
    },
    {
      text: 'Advanced',
      children: [
        { text: 'Frontmatter', link: '/guide/frontmatter' },
        { text: 'Theming', link: '/guide/theming' },
        { text: 'API Reference', link: '/guide/api' },
        {
          text: 'Differences from Vuepress',
          link: '/guide/differences-from-vuepress'
        }
      ]
    }
  ]
}

function getConfigSidebar() {
  return [
    {
      text: 'App Config',
      children: [{ text: 'Basics', link: '/config/basics' }]
    },
    {
      text: 'Theme Config',
      children: [
        { text: 'Homepage', link: '/config/homepage' },
        { text: 'Algolia Search', link: '/config/algolia-search' },
        { text: 'Carbon Ads', link: '/config/carbon-ads' }
      ]
    }
  ]
}

function getHead(pageData: PageData): HeadConfig[] {

  const site = 'https://vitepress.vuejs.org/';
  const canonicalURL = `${site}${pageData.relativePath}`.replace(/.md$/, '.html');
 
  return [
        // Twitter
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:site', content: '@vuejs' }],
        ['meta', { name: 'twitter:title', content: pageData.title }],
        ['meta', { name: 'twitter:description', content: pageData.description || description }],

        // Open Graph
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: lang }],
        ['meta', { property: 'og:site', content: site }],
        ['meta', { property: 'og:site_name', content: 'VitePress' }],
        ['meta', { property: 'og:title', content: pageData.title }],
        ['meta', { property: 'og:description', content: pageData.description || description }],

        // Canonical
        [
          'link',
          {
            rel: 'canonical',
            href: canonicalURL,
          },
        ]
  ]
}