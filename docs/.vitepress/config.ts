import { createRequire } from 'module'
import { defineConfig } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export default defineConfig({
  lang: 'en-US',
  title: 'VitePress',
  // description: 'Vite & Vue powered static site generator.',

  lastUpdated: true,
  cleanUrls: true,

  sitemap: {
    hostname: 'https://vitepress.dev',
    transformItems(items) {
      return items.filter((item) => !item.url.includes('migration'))
    }
  },

  head: [
    ['meta', { name: 'theme-color', content: '#3c8772' }],
    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'AZBRSFGG',
        'data-spa': 'auto',
        defer: ''
      }
    ]
  ],
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      description: 'Vite & Vue powered static site generator.',
      themeConfig: {
        nav: nav(),
        sidebar: {
          '/guide/': sidebarGuide(),
          '/reference/': sidebarReference()
        }
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      description: 'Vite & Vue powered static site generator.',
      themeConfig: {
        nav: zhNav(),
        sidebar: {
          '/zh/guide/': zhSidebarGuide(),
          '/zh/reference/': zhSidebarReference()
        }
      }
    }
  },
  themeConfig: {
    // nav: nav(),

    // sidebar: {
    //   '/guide/': sidebarGuide(),
    //   '/reference/': sidebarReference()
    // },

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

    search: {
      provider: 'algolia',
      options: {
        appId: '8J64VVRP8K',
        apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
        indexName: 'vitepress'
      }
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
      text: 'Reference',
      link: '/reference/site-config',
      activeMatch: '/reference/'
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
        { text: 'Routing', link: '/guide/routing' },
        { text: 'Deploy', link: '/guide/deploy' }
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
        { text: 'Using a Custom Theme', link: '/guide/custom-theme' },
        {
          text: 'Extending the Default Theme',
          link: '/guide/extending-default-theme'
        },
        { text: 'Build-Time Data Loading', link: '/guide/data-loading' },
        { text: 'SSR Compatibility', link: '/guide/ssr-compat' },
        { text: 'Connecting to a CMS', link: '/guide/cms' }
      ]
    },
    {
      text: 'Experimental',
      collapsed: false,
      items: [
        {
          text: 'MPA Mode',
          link: '/guide/mpa-mode'
        },
        {
          text: 'Sitemap Generation',
          link: '/guide/sitemap-generation'
        }
      ]
    },
    // {
    //   text: 'Migrations',
    //   collapsed: false,
    //   items: [
    //     {
    //       text: 'Migration from VuePress',
    //       link: '/guide/migration-from-vuepress'
    //     },
    //     {
    //       text: 'Migration from VitePress 0.x',
    //       link: '/guide/migration-from-vitepress-0'
    //     }
    //   ]
    // },
    {
      text: 'Config & API Reference',
      link: '/reference/site-config'
    }
  ]
}

function sidebarReference() {
  return [
    {
      text: 'Reference',
      items: [
        { text: 'Site Config', link: '/reference/site-config' },
        { text: 'Frontmatter Config', link: '/reference/frontmatter-config' },
        { text: 'Runtime API', link: '/reference/runtime-api' },
        { text: 'CLI', link: '/reference/cli' },
        {
          text: 'Default Theme',
          items: [
            {
              text: 'Overview',
              link: '/reference/default-theme-config'
            },
            {
              text: 'Nav',
              link: '/reference/default-theme-nav'
            },
            {
              text: 'Sidebar',
              link: '/reference/default-theme-sidebar'
            },
            {
              text: 'Home Page',
              link: '/reference/default-theme-home-page'
            },
            {
              text: 'Footer',
              link: '/reference/default-theme-footer'
            },
            {
              text: 'Layout',
              link: '/reference/default-theme-layout'
            },
            {
              text: 'Badge',
              link: '/reference/default-theme-badge'
            },
            {
              text: 'Team Page',
              link: '/reference/default-theme-team-page'
            },
            {
              text: 'Prev / Next Links',
              link: '/reference/default-theme-prev-next-links'
            },
            {
              text: 'Edit Link',
              link: '/reference/default-theme-edit-link'
            },
            {
              text: 'Last Updated Timestamp',
              link: '/reference/default-theme-last-updated'
            },
            {
              text: 'Search',
              link: '/reference/default-theme-search'
            },
            {
              text: 'Carbon Ads',
              link: '/reference/default-theme-carbon-ads'
            }
          ]
        }
      ]
    }
  ]
}

function zhNav() {
  return [
    {
      text: '指引',
      link: '/zh/guide/what-is-vitepress',
      activeMatch: '/zh/guide/'
    },
    {
      text: '配置参考',
      link: '/zh/reference/site-config',
      activeMatch: '/zh/reference/'
    },
    {
      text: pkg.version,
      items: [
        // { text: 'itemA', link: '/item-1' },
        {
          text: '更新日志',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: '贡献',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function zhSidebarGuide() {
  return [
    {
      text: '介绍',
      collapsed: true,
      items: [
        { text: '什么是 VitePress?', link: '/zh/guide/what-is-vitepress' },
        { text: '快速开始', link: '/zh/guide/getting-started' },
        { text: '路由', link: '/zh/guide/routing' },
        { text: '部署', link: '/zh/guide/deploy' }
      ]
    },
    {
      text: '编写',
      collapsed: true,
      items: [
        { text: 'Markdown 基础语法', link: '/zh/guide/markdown-base' },
        { text: 'Markdown 扩展', link: '/zh/guide/markdown' },
        { text: '静态资源处理', link: '/zh/guide/asset-handling' },
        { text: 'Frontmatter', link: '/zh/guide/frontmatter' },
        { text: '在 Markdown 中 使用 Vue', link: '/zh/guide/using-vue' },
        { text: '国际化', link: '/zh/guide/i18n' }
      ]
    },
    {
      text: '自定义',
      collapsed: true,
      items: [
        { text: '使用自定义主题', link: '/zh/guide/custom-theme' },
        { text: '扩展默认主题', link: '/zh/guide/extending-default-theme' },
        { text: '构建时数据加载', link: '/zh/guide/data-loading' },
        { text: 'SSR 兼容性', link: '/zh/guide/ssr-compat' },
        { text: '连接到 CMS', link: '/zh/guide/cms' }
      ]
    },
    {
      text: '实验性的',
      collapsed: true,
      items: [
        {
          text: 'MPA Mode',
          link: '/zh/guide/mpa-mode'
        }
      ]
    },
    {
      text: '配置 & API 参考',
      link: '/zh/reference/site-config'
    }
  ]
}

function zhSidebarReference() {
  return [
    {
      text: '参考',
      items: [
        { text: '站点配置', link: '/zh/reference/site-config' },
        { text: 'Frontmatter 配置', link: '/zh/reference/frontmatter-config' },
        { text: 'Runtime API', link: '/zh/reference/runtime-api' },
        { text: 'CLI', link: '/zh/reference/cli' },
        {
          text: '默认主题',
          items: [
            { text: '概览', link: '/zh/reference/default-theme-config' },
            { text: '导航栏', link: '/zh/reference/default-theme-nav' },
            { text: '侧边栏', link: '/zh/reference/default-theme-sidebar' },
            { text: '主页', link: '/zh/reference/default-theme-home-page' },
            { text: '页脚', link: '/zh/reference/default-theme-footer' },
            { text: '布局', link: '/zh/reference/default-theme-layout' },
            { text: '徽标', link: '/zh/reference/default-theme-badge' },
            { text: '团队', link: '/zh/reference/default-theme-team-page' },
            {
              text: '上（下）一篇',
              link: '/zh/reference/default-theme-prev-next-links'
            },
            { text: '编辑链接', link: '/zh/reference/default-theme-edit-link' },
            {
              text: '最近更新时间',
              link: '/zh/reference/default-theme-last-updated'
            },
            { text: '搜索', link: '/zh/reference/default-theme-search' },
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
