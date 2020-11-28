# Migrating from VuePress

VitePress follows VuePress config and default theme API where possible to ease the migration path. There are although some features that are not present in vitepress because of differences in the [design goals](../index.md) of the two projects. VitePress aims to have bare minimal features for authoring docs and most features are pushed to the Themes, where else VuePress has those features enabled by plugins.

This is a list of changes and removed features compared to [VuePress v1.7.1](https://github.com/vuejs/vuepress/releases/tag/v1.7.1)

::: warning

Note this is early WIP! Currently the focus is on making Vite stable and feature complete first. It is not recommended to use this for anything serious yet.

Some of these differences may be gone before Vitepress 1.0 is released.

:::

## General

- YAML and TOML are not supported formats for site config. Only javascript is supported for `.vitepress/config.js`
- removed [Plugins](https://vuepress.vuejs.org/plugin/) support, features are implemented in themes
- removed [permalink support](https://vuepress.vuejs.org/guide/permalinks.html)
- Components in `.vitepress/components` [are not auto registered as global components](https://vuepress.vuejs.org/)
- [Public files](https://vuepress.vuejs.org/guide/assets.html#public-files) that are directly copied to dist root moved from `.vitepress/public/` to `public/`
- Changed [App Level Enhancements](https://vuepress.vuejs.org/guide/basic-config.html#app-level-enhancements) API, app enhancements moved from `.vitepress/enhanceApp.js` to `.vitepress/theme/index.js`.
- removed [styling](https://vuepress.vuejs.org/config/#styling) `.vitepress/styles/index.styl` and `.vitepress/styles/palette.styl`.
- removed `.vitepress/templates`

## Markdown

- removed support for [toml in frontmatter](https://vuepress.vuejs.org/guide/frontmatter.html#alternative-frontmatter-formats)
- removed [details block](https://vuepress.vuejs.org/guide/markdown.html#custom-containers)
- removed [markdown slots](https://vuepress.vuejs.org/guide/markdown-slot.html)
  guide/using-vue.html#using-components).
- removed `~` prefix to explicitly specify a url is a [webpack module request](https://vuepress.vuejs.org/guide/assets.html#relative-urls)

## Site Config

- renamed `temp` to `tempDir`
- renamed `dest` to `outDir`
- removed [`theme` from a dependency](https://vuepress.vuejs.org/theme/using-a-theme.html#using-a-theme-from-a-dependency)
- removed `permalink`
- removed [`port`](https://vuepress.vuejs.org/config/#port)
- removed [`shouldPrefetch`](https://vuepress.vuejs.org/config/#shouldprefetch)
- removed [`cache`](https://vuepress.vuejs.org/config/#cache)
- removed [`extraWatchFiles`](https://vuepress.vuejs.org/config/#extrawatchfiles)
- removed [`patterns`](https://vuepress.vuejs.org/config/#patterns)
- removed [`plugins`](https://vuepress.vuejs.org/config/#pluggable)
- removed [`markdown.pageSuffix`](https://vuepress.vuejs.org/config/#markdown-pagesuffix)
- removed [`markdown.slugify`](https://vuepress.vuejs.org/config/#markdown-slugify)
- removed [`markdown.plugins`](https://vuepress.vuejs.org/config/#markdown-plugins)
- removed [`markdown.extractHeaders`](https://vuepress.vuejs.org/config/#markdown-extractheaders)
- renamed `markdown.extendMarkdown` to `markdown.config`
- removed `configureWebpack`, `chainWebpack`, `postcss`, `Stylus`, `scss`, `Sass`, `less` configs
- removed [`evergreen`](https://vuepress.vuejs.org/config/#evergreen)

## Default Theme Config

- removed [`smoothScroll`](https://vuepress.vuejs.org/theme/default-theme-config.html#smooth-scrolling)
- removed [`displayAllHeaders`](https://vuepress.vuejs.org/theme/default-theme-config.html#displaying-header-links-of-all-pages)
- removed [`activeHeaderLinks`](https://vuepress.vuejs.org/theme/default-theme-config.html#active-header-links)
- removed `sidebarDepth` and `initialOpenGroupIndex` for [sidebar groups](https://vuepress.vuejs.org/theme/default-theme-config.html#sidebar-groups)
- renamed `searchMaxSuggestions` to `search.maxSuggestions`
- renamed `algolia` to `search.algolia`
- renamed `searchPlaceholder` to `search.placeholder`

# Default Theme

- removed [`<code-group>` and `<code-block>`](https://vuepress.vuejs.org/theme/default-theme-config.html#code-groups-and-code-blocks)

## Computed Globals

- removed `$lang`
- removed `$localePath`

## Frontmatter Predefined Variables

- removed `description`
- removed `meta`
- removed `lang`
- removed [`layout`](https://vuepress.vuejs.org/guide/frontmatter.html#layout)
- removed [`permalink`](https://vuepress.vuejs.org/guide/frontmatter.html#predefined-variables)
- removed [`canonicalUrl`](https://vuepress.vuejs.org/guide/frontmatter.html#predefined-variables)
- removed [`metaTitle`](https://vuepress.vuejs.org/guide/frontmatter.html#predefined-variables)
- removed [`meta`](https://vuepress.vuejs.org/guide/frontmatter.html#meta)

## Frontmatter Default Theme Variables

- removed `prev`, `next`,
- removed [`search`](https://vuepress.vuejs.org/guide/frontmatter.html#search)
- removed [`tags`](https://vuepress.vuejs.org/guide/frontmatter.html#tags)
- removed [`pageClass`](https://vuepress.vuejs.org/theme/default-theme-config.html#custom-page-class)
- removed [`layout`](https://vuepress.vuejs.org/theme/default-theme-config.html#custom-layout-for-specific-pages)

## siteData

- removed [`pages`](https://vuepress.vuejs.org/theme/writing-a-theme.html#site-and-page-metadata)

## pageData

- removed `key`
- removed `path`
- removed `regularPath`

## Default Components

- removed [`<ClientOnly>`](https://vuepress.vuejs.org/guide/using-vue.html#browser-api-access-restrictions)
- removed [`<Badge>`](https://vuepress.vuejs.org/guide/using-vue.html#badge)
