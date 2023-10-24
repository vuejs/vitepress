import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export default defineConfig({
  lang: 'en-US',
  title: 'VitePress',
  // description: 'Vite & Vue powered static site generator.',

  lastUpdated: true,
  cleanUrls: true,

  markdown: {
    math: true
  },

  sitemap: {
    hostname: 'https://vitepress.dev',
    transformItems(items) {
      return items.filter((item) => !item.url.includes('migration'))
    }
  },

  /* prettier-ignore */
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/vitepress-logo-mini.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/vitepress-logo-mini.png' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'VitePress' }],
    ['meta', { name: 'og:image', content: 'https://vitepress.dev/vitepress-og.jpg' }],
    ['script', { src: 'https://cdn.usefathom.com/script.js', 'data-site': 'AZBRSFGG', 'data-spa': 'auto', defer: '' }]
  ],
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      description: 'Vite & Vue powered static site generator.',
      themeConfig: {
        nav: nav(),
        sidebar: {
          '/guide/': { base: '/guide/', items: sidebarGuide() },
          '/reference/': { base: '/reference/', items: sidebarReference() }
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
          '/zh/guide/': { base: '/zh/guide/', items: zhSidebarGuide() },
          '/zh/reference/': {
            base: '/zh/reference/',
            items: zhSidebarReference()
          }
        }
      }
    }
  },
  themeConfig: {
    logo: { src: '/vitepress-logo-mini.svg', width: 24, height: 24 },

    // nav: nav(),

    // sidebar: {
    //   '/guide/': { base: '/guide/', items: sidebarGuide() },
    //   '/reference/': { base: '/reference/', items: sidebarReference() }
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

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Guide',
      link: '/guide/what-is-vitepress',
      activeMatch: '/guide/'
    },
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

/* prettier-ignore */
function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        { text: 'What is VitePress?', link: 'what-is-vitepress' },
        { text: 'Getting Started', link: 'getting-started' },
        { text: 'Routing', link: 'routing' },
        { text: 'Deploy', link: 'deploy' }
      ]
    },
    {
      text: 'Writing',
      collapsed: false,
      items: [
        { text: 'Markdown Extensions', link: 'markdown' },
        { text: 'Asset Handling', link: 'asset-handling' },
        { text: 'Frontmatter', link: 'frontmatter' },
        { text: 'Using Vue in Markdown', link: 'using-vue' },
        { text: 'Internationalization', link: 'i18n' }
      ]
    },
    {
      text: 'Customization',
      collapsed: false,
      items: [
        { text: 'Using a Custom Theme', link: 'custom-theme' },
        { text: 'Extending the Default Theme', link: 'extending-default-theme' },
        { text: 'Build-Time Data Loading', link: 'data-loading' },
        { text: 'SSR Compatibility', link: 'ssr-compat' },
        { text: 'Connecting to a CMS', link: 'cms' }
      ]
    },
    {
      text: 'Experimental',
      collapsed: false,
      items: [
        { text: 'MPA Mode', link: 'mpa-mode' },
        { text: 'Sitemap Generation', link: 'sitemap-generation' }
      ]
    },
    { text: 'Config & API Reference', base: '/reference/', link: 'site-config' }
  ]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Reference',
      items: [
        { text: 'Site Config', link: 'site-config' },
        { text: 'Frontmatter Config', link: 'frontmatter-config' },
        { text: 'Runtime API', link: 'runtime-api' },
        { text: 'CLI', link: 'cli' },
        {
          text: 'Default Theme',
          base: '/zh/reference/default-theme-',
          items: [
            { text: 'Overview', link: 'config' },
            { text: 'Nav', link: 'nav' },
            { text: 'Sidebar', link: 'sidebar' },
            { text: 'Home Page', link: 'home-page' },
            { text: 'Footer', link: 'footer' },
            { text: 'Layout', link: 'layout' },
            { text: 'Badge', link: 'badge' },
            { text: 'Team Page', link: 'team-page' },
            { text: 'Prev / Next Links', link: 'prev-next-links' },
            { text: 'Edit Link', link: 'edit-link' },
            { text: 'Last Updated Timestamp', link: 'last-updated' },
            { text: 'Search', link: 'search' },
            { text: 'Carbon Ads', link: 'carbon-ads' }
          ]
        }
      ]
    }
  ]
}

function zhSidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    // 匹配不同路由，侧边导航有所变化，如果没有多页面需求，可以只写一个数组
    // link 字段以 / 开头，该根目录为 /docs/ 目录
    {
      text: '介绍',
      // 是否可收起
      // 初始折叠状态 true 为折叠
      collapsed: true,
      items: [
        { text: '什么是 VitePress?', link: 'what-is-vitepress' },
        { text: '快速开始', link: 'getting-started' },
        { text: '路由', link: 'routing' },
        { text: '部署', link: 'deploy' }
      ]
    },
    {
      text: '编写',
      collapsed: true,
      items: [
        { text: 'Markdown 基础语法', link: 'markdown-base' },
        { text: 'Markdown 扩展', link: 'markdown' },
        { text: '静态资源处理', link: 'asset-handling' },
        { text: 'Frontmatter', link: 'frontmatter' },
        { text: '在 Markdown 中 使用 Vue', link: 'using-vue' },
        { text: '国际化', link: 'i18n' }
      ]
    },
    {
      text: '自定义',
      collapsed: true,
      items: [
        { text: '使用自定义主题', link: 'custom-theme' },
        { text: '扩展默认主题', link: 'extending-default-theme' },
        { text: '构建时数据加载', link: 'data-loading' },
        { text: 'SSR 兼容性', link: 'ssr-compat' },
        { text: '连接到 CMS', link: 'cms' }
      ]
    },
    {
      text: '实验性的',
      collapsed: true,
      items: [
        {
          text: 'MPA Mode',
          link: '/guide/mpa-mode'
        },
        {
          text: 'Sitemap 生成器',
          link: '/guide/sitemap-generation'
        }
      ]
    },
    // {
    // 	text: '迁移',
    // 	collapsed: false,
    // 	items: [
    // 		{
    // 			text: '从 VuePress 迁移',
    // 			link: '/guide/migration-from-vuepress',
    // 		},
    // 		{
    // 			text: '从 VitePress 0.x 迁移',
    // 			link: '/guide/migration-from-vitepress-0',
    // 		},
    // 	],
    // },
    {
      text: '配置 & API 参考',
      base: '/zh/reference/',
      link: 'site-config'
    }
  ]
}

function zhSidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '参考',
      items: [
        { text: '站点配置', link: 'site-config' },
        { text: 'Frontmatter 配置', link: 'frontmatter-config' },
        { text: 'Runtime API', link: 'runtime-api' },
        { text: 'CLI', link: 'cli' },
        {
          text: '默认主题',
          // collapsed: true,
          base: '/zh/reference/default-theme-',
          items: [
            { text: '概览', link: 'config' },
            { text: '导航栏', link: 'nav' },
            { text: '侧边栏', link: 'sidebar' },
            { text: '主页', link: 'home-page' },
            { text: '页脚', link: 'footer' },
            { text: '布局', link: 'layout' },
            { text: '徽标', link: 'badge' },
            { text: '团队', link: 'team-page' },
            { text: '上（下）一篇', link: 'prev-next-links' },
            { text: '编辑链接', link: 'edit-link' },
            { text: '最近更新时间', link: 'last-updated' },
            { text: '搜索', link: 'search' },
            { text: 'Carbon Ads', link: 'carbon-ads' }
          ]
        }
      ]
    }
  ]
}
function zhNav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '指引',
      link: '/zh/guide/what-is-vitepress',
      activeMatch: '/guide/'
    },
    {
      text: '配置参考',
      link: '/zh/reference/site-config',
      activeMatch: '/reference/'
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
