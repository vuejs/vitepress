import { createRequire } from 'module'
import { defineConfig } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export default defineConfig({
  lang: 'zh-CN',
  description: '由 Vite 和 Vue 驱动的静态站点生成器',

  themeConfig: {
    nav: nav(),
    outline: {
      label: '页面导航'
    },
    lastUpdatedText: '最后更新于',

    sidebar: {
      '/zh/guide/': sidebarGuide(),
      '/zh/reference/': sidebarReference()
    },

    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
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
    {
      text: 'Guide',
      link: '/zh/guide/what-is-vitepress',
      activeMatch: '/zh/guide/'
    },
    {
      text: '参考',
      link: '/zh/reference/site-config',
      activeMatch: '/zh/reference/'
    },
    {
      text: pkg.version,
      items: [
        {
          text: '更新日志',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: '参与贡献',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function sidebarGuide() {
  return [
    {
      text: '简介',
      collapsed: false,
      items: [
        { text: ' VitePress 是什么？', link: '/zh/guide/what-is-vitepress' },
        { text: '快速开始', link: '/zh/guide/getting-started' },
        { text: '路由', link: '/zh/guide/routing' },
        { text: '部署', link: '/zh/guide/deploy' }
      ]
    },
    {
      text: '写作',
      collapsed: false,
      items: [
        { text: 'Markdown Extensions', link: '/zh/guide/markdown' },
        { text: 'Asset Handling', link: '/zh/guide/asset-handling' },
        { text: 'Frontmatter', link: '/zh/guide/frontmatter' },
        { text: 'Using Vue in Markdown', link: '/zh/guide/using-vue' },
        { text: 'Internationalization', link: '/zh/guide/i18n' }
      ]
    },
    {
      text: 'Customization',
      collapsed: false,
      items: [
        { text: 'Using a Custom Theme', link: '/zh/guide/custom-theme' },
        {
          text: 'Extending the Default Theme',
          link: '/zh/guide/extending-default-theme'
        },
        { text: 'Build-Time Data Loading', link: '/zh/guide/data-loading' },
        { text: 'Connecting to a CMS', link: '/zh/guide/cms' }
      ]
    },
    {
      text: 'Experimental',
      collapsed: false,
      items: [
        {
          text: 'MPA Mode',
          link: '/zh/guide/mpa-mode'
        }
      ]
    },
    // {
    //   text: 'Migrations',
    //   collapsed: false,
    //   items: [
    //     {
    //       text: 'Migration from VuePress',
    //       link: '/zh/guide/migration-from-vuepress'
    //     },
    //     {
    //       text: 'Migration from VitePress 0.x',
    //       link: '/zh/guide/migration-from-vitepress-0'
    //     }
    //   ]
    // },
    {
      text: 'Config & API Reference',
      link: '/zh/reference/site-config'
    }
  ]
}

function sidebarReference() {
  return [
    {
      text: 'Reference',
      items: [
        { text: 'Site Config', link: '/zh/reference/site-config' },
        {
          text: 'Frontmatter Config',
          link: '/zh/reference/frontmatter-config'
        },
        { text: 'Runtime API', link: '/zh/reference/runtime-api' },
        { text: 'CLI', link: '/zh/reference/cli' },
        {
          text: 'Default Theme',
          items: [
            {
              text: 'Overview',
              link: '/zh/reference/default-theme-config'
            },
            {
              text: 'Nav',
              link: '/zh/reference/default-theme-nav'
            },
            {
              text: 'Sidebar',
              link: '/zh/reference/default-theme-sidebar'
            },
            {
              text: 'Home Page',
              link: '/zh/reference/default-theme-home-page'
            },
            {
              text: 'Footer',
              link: '/zh/reference/default-theme-footer'
            },
            {
              text: 'Layout',
              link: '/zh/reference/default-theme-layout'
            },
            {
              text: 'Badge',
              link: '/zh/reference/default-theme-badge'
            },
            {
              text: 'Team Page',
              link: '/zh/reference/default-theme-team-page'
            },
            {
              text: 'Prev / Next Links',
              link: '/zh/reference/default-theme-prev-next-links'
            },
            {
              text: 'Edit Link',
              link: '/zh/reference/default-theme-edit-link'
            },
            {
              text: 'Last Updated Timestamp',
              link: '/zh/reference/default-theme-last-updated'
            },
            {
              text: 'Algolia Search',
              link: '/zh/reference/default-theme-search'
            },
            {
              text: 'Carbon Ads',
              link: '/zh/reference/default-theme-carbon-ads'
            }
          ]
        }
      ]
    }
  ]
}
