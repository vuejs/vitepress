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
      text: '指南',
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
        { text: 'Markdown 扩展', link: '/zh/guide/markdown' },
        { text: '资源处理', link: '/zh/guide/asset-handling' },
        { text: 'Frontmatter', link: '/zh/guide/frontmatter' },
        { text: '在 Markdown 中使用 Vue', link: '/zh/guide/using-vue' },
        { text: '国际化', link: '/zh/guide/i18n' }
      ]
    },
    {
      text: '自定义',
      collapsed: false,
      items: [
        { text: '自定义主题', link: '/zh/guide/custom-theme' },
        {
          text: '扩展默认主题',
          link: '/zh/guide/extending-default-theme'
        },
        { text: '构建时数据加载', link: '/zh/guide/data-loading' },
        { text: 'SSR 兼容性', link: '/zh/guide/ssr-compat' },
        { text: '连接 CMS', link: '/zh/guide/cms' }
      ]
    },
    {
      text: '实验性功能',
      collapsed: false,
      items: [
        {
          text: 'MPA 模式',
          link: '/zh/guide/mpa-mode'
        }
      ]
    },
    // {
    //   text: '迁移',
    //   collapsed: false,
    //   items: [
    //     {
    //       text: '从 VuePress 迁移',
    //       link: '/zh/guide/migration-from-vuepress'
    //     },
    //     {
    //       text: '从 VitePress 0.x 迁移',
    //       link: '/zh/guide/migration-from-vitepress-0'
    //     }
    //   ]
    // },
    {
      text: '配置和 API 参考',
      link: '/zh/reference/site-config'
    }
  ]
}

function sidebarReference() {
  return [
    {
      text: '参考',
      items: [
        { text: '站点配置', link: '/zh/reference/site-config' },
        {
          text: 'Frontmatter 配置',
          link: '/zh/reference/frontmatter-config'
        },
        { text: '运行时 API', link: '/zh/reference/runtime-api' },
        { text: 'CLI', link: '/zh/reference/cli' },
        {
          text: '默认主题',
          items: [
            {
              text: '概述',
              link: '/zh/reference/default-theme-config'
            },
            {
              text: '导航',
              link: '/zh/reference/default-theme-nav'
            },
            {
              text: '侧边栏',
              link: '/zh/reference/default-theme-sidebar'
            },
            {
              text: '主页',
              link: '/zh/reference/default-theme-home-page'
            },
            {
              text: '页脚',
              link: '/zh/reference/default-theme-footer'
            },
            {
              text: '布局',
              link: '/zh/reference/default-theme-layout'
            },
            {
              text: '徽章图标',
              link: '/zh/reference/default-theme-badge'
            },
            {
              text: '团队页',
              link: '/zh/reference/default-theme-team-page'
            },
            {
              text: '上下页链接',
              link: '/zh/reference/default-theme-prev-next-links'
            },
            {
              text: '编辑链接',
              link: '/zh/reference/default-theme-edit-link'
            },
            {
              text: '最后更新时间戳',
              link: '/zh/reference/default-theme-last-updated'
            },
            {
              text: 'Algolia 搜索',
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
