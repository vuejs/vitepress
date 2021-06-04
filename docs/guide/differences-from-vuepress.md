# Differences from VuePress

VitePress and VuePress have different [design goals](../index.md). Both projects share similar config naming conventions. VitePress aims to have the bare minimum features needed for authoring docs. Other features are pushed to Themes. On the other hand, VuePress has more features out-of-the-box or enabled by its ecosystem of plugins.

::: tip
If you are using VuePress, there is no need to migrate to VitePress. Both projects are going to continue to co-exist for the foreseeable future.
:::

::: warning
Note this is early WIP! Currently, the focus is on making Vite stable and feature-complete first. It is not recommended to use this for anything serious yet.
:::

In case you decide to move your project to VitePress, this is a list of differences from [VuePress v1.7.1](https://github.com/vuejs/vuepress/releases/tag/v1.7.1) that you need to take into account.

## General

- Missing
  - YAML and TOML are not supported formats for site config. Only javascript is supported for `.vitepress/config.js`
  - [Plugins](https://vuepress.vuejs.org/plugin/) support, features are implemented in themes
  - [permalink support](https://vuepress.vuejs.org/guide/permalinks.html)
  - `.vitepress/templates`
  - Components in `.vitepress/components` [are not auto registered as global components](https://vuepress.vuejs.org/)
- Differences
  - [Public files](https://vuepress.vuejs.org/guide/assets.html#public-files) that are directly copied to dist root moved from `.vitepress/public/` is `public/`
  - [styling](https://vuepress.vuejs.org/config/#styling) `.vitepress/styles/index.styl` and `.vitepress/styles/palette.styl` is `.vitepress/style.styl`
  - [App Level Enhancements](https://vuepress.vuejs.org/guide/basic-config.html#app-level-enhancements) API, app enhancements `.vitepress/enhanceApp.js` is `.vitepress/theme/index.js`.

## Markdown

- Missing
  - Support for [toml in frontmatter](https://vuepress.vuejs.org/guide/frontmatter.html#alternative-frontmatter-formats)
  - [details block](https://vuepress.vuejs.org/guide/markdown.html#custom-containers)
  - [markdown slots](https://vuepress.vuejs.org/guide/markdown-slot.html)
    guide/using-vue.html#using-components).
  - `~` prefix to explicitly specify a url is a [webpack module request](https://vuepress.vuejs.org/guide/assets.html#relative-urls)

## Site Config

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

## Default Theme Config

- Missing
  - [`smoothScroll`](https://vuepress.vuejs.org/theme/default-theme-config.html#smooth-scrolling)
  - [`displayAllHeaders`](https://vuepress.vuejs.org/theme/default-theme-config.html#displaying-header-links-of-all-pages)
  - [`activeHeaderLinks`](https://vuepress.vuejs.org/theme/default-theme-config.html#active-header-links)
  - `sidebarDepth` and `initialOpenGroupIndex` for [sidebar groups](https://vuepress.vuejs.org/theme/default-theme-config.html#sidebar-groups)
- Differences
  - `searchMaxSuggestions` is `search.maxSuggestions`
  - `algolia` is `search.algolia`
  - `searchPlaceholder` is `search.placeholder`

## Default Theme

- Missing
  - [`<code-group>` and `<code-block>`](https://vuepress.vuejs.org/theme/default-theme-config.html#code-groups-and-code-blocks)

## Computed Globals

- Missing
  - `$lang`
  - `$localePath`

## Frontmatter Predefined Variables

- Missing
  - `description`
  - [`meta`](https://vuepress.vuejs.org/guide/frontmatter.html#meta)
  - [`metaTitle`](https://vuepress.vuejs.org/guide/frontmatter.html#predefined-variables)
  - `lang`
  - [`layout`](https://vuepress.vuejs.org/guide/frontmatter.html#layout)
  - [`permalink`](https://vuepress.vuejs.org/guide/frontmatter.html#predefined-variables)
  - [`canonicalUrl`](https://vuepress.vuejs.org/guide/frontmatter.html#predefined-variables)

## Frontmatter Default Theme Variables

- Missing
  - `prev`, `next`
  - [`search`](https://vuepress.vuejs.org/guide/frontmatter.html#search)
  - [`tags`](https://vuepress.vuejs.org/guide/frontmatter.html#tags)
  - [`pageClass`](https://vuepress.vuejs.org/theme/default-theme-config.html#custom-page-class)
  - [`layout`](https://vuepress.vuejs.org/theme/default-theme-config.html#custom-layout-for-specific-pages)

## siteData

- Missing
  - [`pages`](https://vuepress.vuejs.org/theme/writing-a-theme.html#site-and-page-metadata)

## pageData

- Missing
  - `key`
  - `path`
  - `regularPath`

## Global Components

- Missing
  - [`<Badge>`](https://vuepress.vuejs.org/guide/using-vue.html#badge)
