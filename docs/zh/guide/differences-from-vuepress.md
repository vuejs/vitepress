---
sidebarDepth: 2
---
# Differences from VuePress 与 VuePress 的差异

VitePress 和 VuePress 有不同的设计目标。两个项目都共享相似的配置命名规范。VitePress 要求最少的功能，其他功能由主题推出。而 VuePress 有更多开箱即用的功能，或由其系统环境的插件推出。

::: tip
如果你正在使用 VuePress，那么不需要迁移到 VitePress。两个项目都会并存在可预见的未来。
:::

::: warning
注意：这是一个早期的 WIP！目前，焦点在于使 Vite 变稳定和功能完整。不建议对涉及重大事情使用。
:::

如果你决定移动你的项目到 VitePress，这是你需要考虑的 VuePress v1.7.1 的差异列表。

## General 

- Missing
  - 不支持 YAML 和 TOML 的站点配置文件格式。只支持 `.vitepress/config.js` 文件
  - [插件](https://vuepress.vuejs.org/plugin/) 支持，功能由主题实现
  - [permalink 支持](https://vuepress.vuejs.org/guide/permalinks.html)
  - `.vitepress/templates`
  - `.vitepress/components` 中的组件 [不会自动注册为全局组件](https://vuepress.vuejs.org/)
- Differences
  - [公共文件](https://vuepress.vuejs.org/guide/assets.html#public-files)，直接拷贝到 dist 根目录的文件，从 `.vitepress/public/` 移动到 `public/`
  - [样式](https://vuepress.vuejs.org/config/#styling) `.vitepress/styles/index.styl` 和 `.vitepress/styles/palette.styl` 不支持。请参阅 [自定义 CSS](/guide/theming.html#customizing-css)。
  - [应用级增强](https://vuepress.vuejs.org/guide/basic-config.html#app-level-enhancements) API，应用级增强 `.vitepress/enhanceApp.js` 现在在 `.vitepress/theme/index.js` 中完成。请参阅 [扩展默认主题](/guide/theming.html#extending-the-default-theme)。

## Markdown

- Missing
  - 支持 [toml 在frontmatter](https://vuepress.vuejs.org/guide/frontmatter.html#alternative-frontmatter-formats)
  - [details block](https://vuepress.vuejs.org/guide/markdown.html#custom-containers)
  - [markdown slots](https://vuepress.vuejs.org/guide/markdown-slot.html)
  - `~` 前缀来显式指定一个 url 是一个 [webpack 模块请求](https://vuepress.vuejs.org/guide/assets.html#relative-urls)

## 站点配置

- Missing
  - `temp`
  - `dest`
  - [`theme` from a dependency](https://vuepress.vuejs.org/theme/using-a-theme.html#using-a-theme-from-a-dependency)
  - `permalink`
  - [`port`](https://vuepress.vuejs.org/config/#port)
  - [`shouldPrefetch`](https://vuepress.vuejs.org/config/#shouldprefetch)
  - [`cache`](https://vuepress.vuejs.org/config/#cache)
  - [`extraWatchFiles`](https://vuepress.vuejs.org/config/#extrawatchfiles)
  - [`patterns`](https://vuepress.vuejs.org/config/#patterns)
  - [`plugins`](https://vuepress.vuejs.org/config/#pluggable)
  - [`markdown.pageSuffix`](https://vuepress.vuejs.org/config/#markdown-pagesuffix)
  - [`markdown.slugify`](https://vuepress.vuejs.org/config/#markdown-slugify)
  - [`markdown.plugins`](https://vuepress.vuejs.org/config/#markdown-plugins)
  - [`markdown.extractHeaders`](https://vuepress.vuejs.org/config/#markdown-extractheaders)
  - `markdown.extendMarkdown` to `markdown.config`
  - `configureWebpack`, `chainWebpack`, `postcss`, `Stylus`, `scss`, `Sass`, `less` configs
  - [`evergreen`](https://vuepress.vuejs.org/config/#evergreen)

## 默认主题配置

- Missing
  - [`smoothScroll`](https://vuepress.vuejs.org/theme/default-theme-config.html#smooth-scrolling)
  - [`displayAllHeaders`](https://vuepress.vuejs.org/theme/default-theme-config.html#displaying-header-links-of-all-pages)
  - [`activeHeaderLinks`](https://vuepress.vuejs.org/theme/default-theme-config.html#active-header-links)
  - `sidebarDepth` and `initialOpenGroupIndex` for [sidebar groups](https://vuepress.vuejs.org/theme/default-theme-config.html#sidebar-groups)
- Differences
  - `searchMaxSuggestions` is `search.maxSuggestions`
  - `algolia` is `search.algolia`
  - `searchPlaceholder` is `search.placeholder`

## 默认主题

- Missing
  - [`<code-group>` and `<code-block>`](https://vuepress.vuejs.org/theme/default-theme-config.html#code-groups-and-code-blocks)

## 全局计算属性

- Missing
  - `$lang`
  - `$localePath`

## 前言预定义变量

- Missing
  - `description`
  - [`meta`](https://vuepress.vuejs.org/guide/frontmatter.html#meta)
  - [`metaTitle`](https://vuepress.vuejs.org/guide/frontmatter.html#predefined-variables)
  - `lang`
  - [`layout`](https://vuepress.vuejs.org/guide/frontmatter.html#layout)
  - [`permalink`](https://vuepress.vuejs.org/guide/frontmatter.html#predefined-variables)
  - [`canonicalUrl`](https://vuepress.vuejs.org/guide/frontmatter.html#predefined-variables)

## 前言预定义变量

- Missing
  - `prev`, `next`
  - [`search`](https://vuepress.vuejs.org/guide/frontmatter.html#search)
  - [`tags`](https://vuepress.vuejs.org/guide/frontmatter.html#tags)
  - [`pageClass`](https://vuepress.vuejs.org/theme/default-theme-config.html#custom-page-class)
  - [`layout`](https://vuepress.vuejs.org/theme/default-theme-config.html#custom-layout-for-specific-pages)

## 站点数据

- Missing
  - [`pages`](https://vuepress.vuejs.org/theme/writing-a-theme.html#site-and-page-metadata)

## 页面数据

- Missing
  - `key`
  - `path`
  - `regularPath`

## 全局组件

- Missing
  - [`<Badge>`](https://vuepress.vuejs.org/guide/using-vue.html#badge)
