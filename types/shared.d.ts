// types shared between server and client
import type { UseDarkOptions } from '@vueuse/core'
import type { Component, Ref } from 'vue'
import type { SSRContext } from 'vue/server-renderer'
export type { DefaultTheme } from './default-theme.js'

/**
 * A value of type `T`, or a promise resolving to it.
 */
export type Awaitable<T> = T | PromiseLike<T>

/**
 * Recursively makes all properties of `T` optional, leaving non-plain
 * objects (dates, regexps, functions, collections) as-is.
 */
export type DeepPartial<T> =
  T extends Record<string, any>
    ? T extends
        | Date
        | RegExp
        | Function
        | ReadonlyMap<any, any>
        | ReadonlySet<any>
        | ReadonlyArray<any>
      ? T
      : { [P in keyof T]?: DeepPartial<T[P]> }
    : T

/**
 * The data of a page, available on both server and client.
 */
export interface PageData {
  /**
   * The path of the page relative to the source directory, with rewrites
   * applied. Determines the URL of the page.
   */
  relativePath: string
  /**
   * The path of the actual source file relative to the source directory.
   * Differs from `relativePath` when path rewrites are in use, points to
   * the route template for dynamic routes, and is an empty string if the
   * page is virtual (e.g. the 404 page).
   */
  filePath: string
  /**
   * The title of the page, from its frontmatter or its first level-1
   * heading.
   */
  title: string
  /**
   * The suffix appended to the title (`title | suffix`), or a template
   * containing the `:title` token. Set to `false` to use the title as-is.
   */
  titleTemplate?: string | boolean
  /**
   * The description of the page, from its frontmatter.
   */
  description: string
  /**
   * The section headers extracted from the page.
   */
  headers: Header[]
  /**
   * The frontmatter of the page.
   */
  frontmatter: Record<string, any>
  /**
   * The route params of the page, if it belongs to a dynamic route.
   */
  params?: Record<string, any>
  /**
   * Whether the page is the not-found (404) page.
   */
  isNotFound?: boolean
  /**
   * The timestamp (in milliseconds) of the last update, from the page's
   * frontmatter or its last git commit.
   */
  lastUpdated?: number
}

/**
 * A block of the Vue SFC generated from a markdown source file.
 */
export interface SfcBlock {
  /**
   * The type of the block.
   */
  type: string
  /**
   * The content of the block, including its open and close tags.
   */
  content: string
  /**
   * The content of the block, with its open and close tags stripped.
   */
  contentStripped: string
  /**
   * The open tag of the block.
   */
  tagOpen: string
  /**
   * The close tag of the block.
   */
  tagClose: string
}

/**
 * The SFC blocks extracted from a markdown source file.
 */
export interface MarkdownSfcBlocks {
  /**
   * The `<template>` block.
   */
  template: SfcBlock | null
  /**
   * The common `<script>` block.
   */
  script: SfcBlock | null
  /**
   * The `<script setup>` block.
   */
  scriptSetup: SfcBlock | null
  /**
   * All `<script>` blocks. An SFC normally allows a single `<script>` block
   * and a single `<script setup>` block, but some tools may support more,
   * so all of them are kept here.
   */
  scripts: SfcBlock[]
  /**
   * All `<style>` blocks.
   */
  styles: SfcBlock[]
  /**
   * All custom blocks.
   */
  customBlocks: SfcBlock[]
}

/**
 * A section header extracted from a page.
 */
export interface Header {
  /**
   * The level of the header, `1` to `6` for `<h1>` to `<h6>`.
   */
  level: number
  /**
   * The title of the header.
   */
  title: string
  /**
   * The slug of the header, typically the `id` attribute of its anchor.
   */
  slug: string
  /**
   * The link of the header, typically `#${slug}`.
   */
  link: string
  /**
   * The nested child headers.
   */
  children: Header[]
}

/**
 * Site-level data, resolved from the user config for the active locale.
 */
export interface SiteData<ThemeConfig = any> {
  /**
   * The base URL the site is deployed at.
   * @default '/'
   */
  base: string
  /**
   * Whether VitePress generates URLs without a trailing `.html`.
   * @default false
   */
  cleanUrls?: boolean
  /**
   * The `lang` attribute of the site.
   * @default 'en-US'
   */
  lang: string
  /**
   * The text direction (`dir` attribute) of the site.
   * @default 'ltr'
   */
  dir: string
  /**
   * The title of the site.
   * @default 'VitePress'
   */
  title: string
  /**
   * The suffix appended to page titles (`title | suffix`), or a template
   * containing the `:title` token. Set to `false` to use page titles as-is.
   */
  titleTemplate?: string | boolean
  /**
   * The description of the site.
   * @default 'A VitePress site'
   */
  description: string
  /**
   * Additional elements to render in the `<head>` tag of every page.
   */
  head: HeadConfig[]
  /**
   * The dark mode behavior: `true` for a toggleable dark mode, `'dark'` to
   * default to it, `'force-dark'`/`'force-auto'` to force the mode, or
   * options for `useDark` from `@vueuse/core`. `false` disables it.
   * @default true
   */
  appearance:
    | boolean
    | 'dark'
    | 'force-dark'
    | 'force-auto'
    | (Omit<UseDarkOptions, 'initialValue'> & { initialValue?: 'dark' })
  /**
   * The config of the active theme.
   */
  themeConfig: ThemeConfig
  /**
   * The config overrides of each locale, keyed by its directory
   * (`'root'` for the default locale).
   */
  locales: LocaleConfig<ThemeConfig>
  /**
   * The key of the active locale in `locales`.
   */
  localeIndex?: string
  /**
   * Props passed to the wrapper element rendered by the `Content` component.
   */
  contentProps?: Record<string, any>
  /**
   * Client router options.
   */
  router: {
    /**
     * Whether links are prefetched when they enter the viewport.
     * @default true
     */
    prefetchLinks: boolean
  }
  /**
   * Config overrides applied to pages by source directory: either a dict
   * mapping a directory (e.g. `/guide/`) to overrides, where deeper
   * directories take precedence, or a function returning the overrides to
   * apply for a page. Directories are resolved against the source paths of
   * pages, before rewrites.
   */
  additionalConfig?:
    AdditionalConfigDict<ThemeConfig> | AdditionalConfigLoader<ThemeConfig>
}

/**
 * Reactive data exposed by the `useData` composable.
 */
export interface VitePressData<T = any> {
  /**
   * The site-level data for the active locale.
   */
  site: Ref<SiteData<T>>
  /**
   * The config of the active theme.
   */
  theme: Ref<T>
  /**
   * The data of the current page.
   */
  page: Ref<PageData>
  /**
   * The frontmatter of the current page.
   */
  frontmatter: Ref<PageData['frontmatter']>
  /**
   * The route params of the current page.
   */
  params: Ref<PageData['params']>
  /**
   * The resolved title of the current page.
   */
  title: Ref<string>
  /**
   * The resolved description of the current page.
   */
  description: Ref<string>
  /**
   * The `lang` attribute of the active locale.
   */
  lang: Ref<string>
  /**
   * The text direction of the active locale.
   */
  dir: Ref<string>
  /**
   * The key of the active locale.
   */
  localeIndex: Ref<string>
  /**
   * Whether dark mode is currently active.
   */
  isDark: Ref<boolean>
}

/**
 * The currently matched route.
 */
export interface Route {
  /**
   * The pathname of the current URL.
   */
  path: string
  /**
   * The hash of the current URL, including the leading `#`.
   */
  hash: string
  /**
   * The query string of the current URL, including the leading `?`.
   */
  query: string
  /**
   * The data of the matched page.
   */
  data: PageData
  /**
   * The component of the matched page, once resolved.
   */
  component: Component | null
}

/**
 * A head entry as `[tag, attrs]` or `[tag, attrs, innerHTML]`, e.g.
 * `['link', { rel: 'icon', href: '/favicon.ico' }]`.
 */
export type HeadConfig =
  [string, Record<string, string>] | [string, Record<string, string>, string]

/**
 * The payload sent to the client when page data is hot-updated.
 */
export interface PageDataPayload {
  /**
   * The path of the updated page relative to the source directory, with
   * rewrites applied and a leading slash.
   */
  path: string
  /**
   * The new data of the updated page.
   */
  pageData: PageData
}

/**
 * The SSR context used when rendering a page to static HTML.
 */
export interface SSGContext extends SSRContext {
  /**
   * The rendered HTML content of the page.
   */
  content: string
  /**
   * The names of the social icons used on the page, collected so that only
   * the styles of used icons are emitted.
   * @experimental
   */
  vpSocialIcons: Set<string>
}

/**
 * The site config options that can be overridden per locale.
 */
export interface LocaleSpecificConfig<ThemeConfig = any> {
  /**
   * The `lang` attribute of the locale.
   */
  lang?: string
  /**
   * The text direction of the locale.
   */
  dir?: string
  /**
   * The title of the site in the locale.
   */
  title?: string
  /**
   * The suffix appended to page titles (`title | suffix`), or a template
   * containing the `:title` token. Set to `false` to use page titles as-is.
   */
  titleTemplate?: string | boolean
  /**
   * The description of the site in the locale.
   */
  description?: string
  /**
   * Additional head entries for the locale, merged with the root ones.
   */
  head?: HeadConfig[]
  /**
   * Theme config overrides for the locale, merged with the root theme
   * config.
   */
  themeConfig?: DeepPartial<ThemeConfig>
}

/**
 * The labels of custom containers and GitHub-style alerts.
 */
export interface ContainerOptions {
  /**
   * The label of `::: info` containers.
   * @default 'INFO'
   */
  infoLabel?: string
  /**
   * The label of `> [!NOTE]` alerts.
   * @default 'NOTE'
   */
  noteLabel?: string
  /**
   * The label of `::: tip` containers.
   * @default 'TIP'
   */
  tipLabel?: string
  /**
   * The label of `::: warning` containers.
   * @default 'WARNING'
   */
  warningLabel?: string
  /**
   * The label of `::: danger` containers.
   * @default 'DANGER'
   */
  dangerLabel?: string
  /**
   * The label of `::: details` containers.
   * @default 'Details'
   */
  detailsLabel?: string
  /**
   * The label of `> [!IMPORTANT]` alerts.
   * @default 'IMPORTANT'
   */
  importantLabel?: string
  /**
   * The label of `> [!CAUTION]` alerts.
   * @default 'CAUTION'
   */
  cautionLabel?: string
  /**
   * Additional containers to register, mapping the container name to its
   * default title. Registered names work both as `::: name` blocks and as
   * GitHub-style alerts (`> [!NAME]`), and are styleable in the theme via
   * `.custom-block.name`. Names must be lowercase and may only contain
   * letters, numbers, hyphens, and underscores.
   *
   * In locale-specific overrides only the titles of containers registered
   * at the root level can be changed - new names cannot be added there.
   */
  customContainers?: Record<string, string>
}

/**
 * The strings used by the copy button in code blocks.
 */
export interface CodeCopyButtonOptions {
  /**
   * The tooltip (`title` attribute) of the copy button in code blocks.
   * @default 'Copy code'
   */
  tooltipText?: string
  /**
   * The text shown next to the copy button after copying.
   * @default 'Copied'
   */
  copiedText?: string
}

/**
 * Build-time markdown strings that can be overridden per locale. Set them
 * under `locales.<index>.markdown` in the site config; values fall back to
 * the root `markdown` options when a locale leaves them unset.
 */
export interface MarkdownLocaleOptions {
  /**
   * Locale-specific labels for containers (`::: tip` etc.) and
   * GitHub-flavored alerts.
   */
  container?: ContainerOptions
  /**
   * Locale-specific strings for the copy button in code blocks.
   */
  codeCopyButton?: CodeCopyButtonOptions
}

/**
 * The locale configs of the site, keyed by locale directory
 * (`'root'` for the default locale).
 */
export type LocaleConfig<ThemeConfig = any> = Record<
  string,
  LocaleSpecificConfig<ThemeConfig> & {
    /**
     * The label of the locale in the locale menu.
     */
    label: string
    /**
     * The link of the locale menu item. Defaults to the locale directory.
     */
    link?: string
    /**
     * The markdown strings of the locale.
     */
    markdown?: MarkdownLocaleOptions
  }
>

/**
 * Config overrides applied to a page on top of its locale config.
 */
export type AdditionalConfig<ThemeConfig = any> =
  LocaleSpecificConfig<ThemeConfig>

/**
 * Additional configs keyed by the source directory they apply to
 * (e.g. `/guide/`).
 */
export type AdditionalConfigDict<ThemeConfig = any> = Record<
  string,
  AdditionalConfig<ThemeConfig>
>

/**
 * Resolves the additional configs of a page from its source path, ordered
 * from highest to lowest priority.
 */
export type AdditionalConfigLoader<ThemeConfig = any> = (
  filePath: string
) => AdditionalConfig<ThemeConfig>[] | void

// Manually declaring all properties as rollup-plugin-dts
// is unable to merge augmented module declarations
/**
 * The environment object passed to `markdown-it` when rendering a page.
 */
export interface MarkdownEnv {
  /**
   * The raw markdown content, with the frontmatter stripped.
   */
  content?: string
  /**
   * The excerpt extracted by `@mdit-vue/plugin-frontmatter`, rendered as
   * HTML when excerpt rendering is enabled and kept as raw markdown
   * otherwise.
   */
  excerpt?: string
  /**
   * The frontmatter extracted by `@mdit-vue/plugin-frontmatter`.
   */
  frontmatter?: Record<string, unknown>
  /**
   * The headers extracted by `@mdit-vue/plugin-headers`.
   */
  headers?: Header[]
  /**
   * The SFC blocks extracted by `@mdit-vue/plugin-sfc`.
   */
  sfcBlocks?: MarkdownSfcBlocks
  /**
   * The title extracted by `@mdit-vue/plugin-title`.
   */
  title?: string
  /**
   * The absolute path of the page, with rewrites applied.
   */
  path: string
  /**
   * The path of the page relative to the source directory, with rewrites
   * applied.
   */
  relativePath: string
  /**
   * Whether clean URLs are enabled.
   */
  cleanUrls: boolean
  /**
   * The URLs of the links collected from the page for the dead link check.
   */
  links?: string[]
  /**
   * The line numbers at which each of `links` appears in the source.
   */
  linkLines?: number[]
  /**
   * The absolute paths of the files inlined via `<!--@include-->`.
   */
  includes?: string[]
  /**
   * The absolute path of the actual source file on disk: the route template
   * for dynamic routes, or the original file when rewrites are in use.
   */
  realPath?: string
  /**
   * The key of the locale the page belongs to.
   */
  localeIndex?: string
}
