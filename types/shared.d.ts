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
   * The path of the actual source file relative to the source directory:
   * differs from `relativePath` when rewrites are in use, points to the
   * route template for dynamic routes, and is empty for virtual pages
   * (e.g. the 404 page).
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
   * The base URL the site is deployed at, or `'./'` when each page
   * references the site relative to its own depth.
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
   * Config overrides applied to pages by source directory (before
   * rewrites): a dict mapping a directory (e.g. `/guide/`) to overrides,
   * deeper directories taking precedence, or a function returning the
   * overrides for a page.
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
   * The icons used on the page, registered during SSR (via `useIcon`) so
   * that only their styles are emitted. Names are fully qualified as
   * `collection:name`.
   */
  vpIcons: Set<string>
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
   * default title. Names must be lowercase (letters, numbers, hyphens,
   * underscores), work as both `::: name` blocks and `> [!NAME]` alerts,
   * and are styleable via `.custom-block.name`. Locale overrides may only
   * change the titles of root-registered names.
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
 * Markdown strings overridable per locale via `locales.<index>.markdown`,
 * falling back to the root `markdown` options when unset.
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

// all properties are declared manually as rollup-plugin-dts cannot merge
// augmented module declarations
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
   * Whether the rendered HTML is emitted at `relativePath`, so site-absolute
   * links may be rewritten relative to it. Content loaders must not set it:
   * their HTML is embedded in other pages.
   * @internal
   */
  relativizeUrls?: boolean
  /**
   * The links collected from the page for the dead link check.
   */
  links?: MarkdownLink[]
  /**
   * The absolute paths of the files inlined via `<!--@include-->` and
   * imported via `<<<` code snippets, used for watch invalidation.
   */
  includes?: string[]
  /**
   * The markdown source with includes expanded, set during rendering when
   * include processing is enabled.
   */
  src?: string
  /**
   * Maps lines of the rendered source (`src`) back to the physical files
   * they came from, set by the include plugin. Token maps stay in rendered
   * source coordinates; every position that leaves the markdown layer must
   * be translated through this.
   */
  lineMap?: MarkdownLineMap
  /**
   * The absolute path of the actual source file on disk: the route template
   * for dynamic routes, or the original file when rewrites are in use.
   */
  realPath?: string
  /**
   * The key of the locale the page belongs to.
   */
  localeIndex?: string
  /**
   * The expressions inlined by eager frontmatter interpolation while
   * rendering, with the value each resolved to - used to detect values that
   * `transformPageData` changes after the fact.
   * @internal
   */
  eagerInterpolations?: { expression: string; value: string }[]
}

/**
 * A link collected while rendering markdown.
 */
export interface MarkdownLink {
  /**
   * The normalized URL the link renders with, used to resolve the target
   * page for the dead link check.
   */
  url: string
  /**
   * The destination as authored in the source, decoded.
   */
  raw: string
  /**
   * Where the link was authored, when known.
   */
  loc?: MarkdownSourceLoc
}

/**
 * A position in a source file, in editor coordinates.
 */
export interface MarkdownSourceLoc {
  /**
   * Absolute path of the physical file containing the construct — with
   * includes, the included file rather than the page. Absent when the render
   * has no backing file.
   */
  file?: string
  /**
   * 1-based line in `file`.
   */
  line: number
  /**
   * 1-based column, present when it could be determined exactly.
   */
  column?: number
}

/**
 * Maps 0-based lines of the rendered markdown source (`MarkdownEnv.src`) to
 * the physical file and 0-based line they came from.
 */
export interface MarkdownLineMap {
  resolve(line: number): {
    file: string
    line: number
    /**
     * Set when the line was stitched together from more than one source
     * (a mid-line include splice) — column positions on it are not
     * meaningful in any single file.
     */
    spliced?: boolean
  }
}
