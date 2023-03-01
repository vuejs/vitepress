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
      '/guide/': sidebarGuide(),
      '/config/': sidebarConfig(),
      '/api/': sidebarGuide()
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
      text: '运行时 API',
      link: '/zh/api/',
      activeMatch: '/zh/api/'
    },
    {
      text: '配置参考',
      link: '/zh/config/introduction',
      activeMatch: '/zh/config/'
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
      collapsed: true,
      items: [
        { text: 'VitePress 是什么', link: '/zh/guide/what-is-vitepress' },
        { text: '快速开始', link: '/zh/guide/getting-started' },
        { text: '配置', link: '/zh/guide/configuration' },
        { text: '路由', link: '/zh/guide/routing' },
        { text: '部署', link: '/zh/guide/deploying' },
        { text: '国际化', link: '/zh/guide/i18n' }
      ]
    },
    {
      text: '写作',
      collapsed: true,
      items: [
        { text: 'Markdown 扩展', link: '/zh/guide/markdown' },
        { text: '资源处理', link: '/zh/guide/asset-handling' },
        { text: 'Frontmatter', link: '/zh/guide/frontmatter' },
        { text: '在 Markdown 中使用 Vue', link: '/zh/guide/using-vue' },
        { text: 'API 参考', link: '/zh/guide/api' }
      ]
    },
    {
      text: '主题',
      collapsed: true,
      items: [
        { text: '简介', link: '/zh/guide/theme-introduction' },
        { text: '导航', link: '/zh/guide/theme-nav' },
        { text: '侧边栏', link: '/zh/guide/theme-sidebar' },
        { text: '上下页链接', link: '/zh/guide/theme-prev-next-link' },
        { text: '编辑链接', link: '/zh/guide/theme-edit-link' },
        { text: '最后更新', link: '/zh/guide/theme-last-updated' },
        { text: '布局', link: '/zh/guide/theme-layout' },
        { text: '主页', link: '/zh/guide/theme-home-page' },
        { text: '团队页', link: '/zh/guide/theme-team-page' },
        { text: '徽章', link: '/zh/guide/theme-badge' },
        { text: '页脚', link: '/zh/guide/theme-footer' },
        { text: '搜索', link: '/zh/guide/theme-search' },
        { text: 'Carbon Ads', link: '/zh/guide/theme-carbon-ads' }
      ]
    },
    {
      text: '迁移',
      collapsed: true,
      items: [
        {
          text: '从 VuePress 迁移',
          link: '/zh/guide/migration-from-vuepress'
        },
        {
          text: '从 VitePress 0.x 迁移',
          link: '/zh/guide/migration-from-vitepress-0'
        }
      ]
    },
    {
      text: '自定义',
      collapsed: false,
      items: [
        { text: '默认主题', link: '/guide/default-theme' },
        {
          text: '扩展默认主题',
          link: '/zh/guide/customization-extending-default-theme'
        },
        { text: '构建自定义主题', link: '/zh/guide/customization-intro' },
        {
          text: '运行时 API',
          link: '/zh/api/'
        },
        { text: 'Build-Time Data Loading', link: '/zh/guide/data-loading' }
      ]
    }
  ]
}

function sidebarConfig() {
  return [
    {
      text: '配置参考',
      items: [
        { text: '简介', link: '/zh/config/introduction' },
        { text: '应用全局配置', link: '/zh/config/app-config' },
        { text: '主题配置', link: '/zh/config/theme-config' },
        { text: 'Frontmatter 配置', link: '/zh/config/frontmatter-config' }
      ]
    }
  ]
}
