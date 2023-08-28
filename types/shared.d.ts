// types shared between server and client
import type { MarkdownSfcBlocks } from '@mdit-vue/plugin-sfc'
import type { UseDarkOptions } from '@vueuse/core'
import type { SSRContext } from 'vue/server-renderer'
export type { DefaultTheme } from './default-theme.js'

export type Awaitable<T> = T | PromiseLike<T>

export interface PageData {
  relativePath: string
  filePath: string // differs from relativePath in case of path rewrites
  title: string
  titleTemplate?: string | boolean
  description: string
  headers: Header[]
  frontmatter: Record<string, any>
  params?: Record<string, any>
  isNotFound?: boolean
  lastUpdated?: number
}

export interface Header {
  /**
   * The level of the header
   *
   * `1` to `6` for `<h1>` to `<h6>`
   */
  level: number
  /**
   * The title of the header
   */
  title: string
  /**
   * The slug of the header
   *
   * Typically the `id` attr of the header anchor
   */
  slug: string
  /**
   * Link of the header
   *
   * Typically using `#${slug}` as the anchor hash
   */
  link: string
  /**
   * The children of the header
   */
  children: Header[]
}

export interface SiteData<ThemeConfig = any> {
  base: string
  cleanUrls?: boolean
  lang: string
  dir: string
  title: string
  titleTemplate?: string | boolean
  description: string
  head: HeadConfig[]
  appearance:
    | boolean
    | 'dark'
    | (Omit<UseDarkOptions, 'initialValue'> & { initialValue?: 'dark' })
  themeConfig: ThemeConfig
  scrollOffset:
    | number
    | string
    | string[]
    | { selector: string | string[]; padding: number }
  locales: LocaleConfig<ThemeConfig>
  localeIndex?: string
  contentProps?: Record<string, any>
}

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]

export interface PageDataPayload {
  path: string
  pageData: PageData
}

export interface SSGContext extends SSRContext {
  content: string
}

export interface LocaleSpecificConfig<ThemeConfig = any> {
  lang?: string
  dir?: string
  title?: string
  titleTemplate?: string | boolean
  description?: string
  head?: HeadConfig[]
  themeConfig?: ThemeConfig
}

export type LocaleConfig<ThemeConfig = any> = Record<
  string,
  LocaleSpecificConfig<ThemeConfig> & { label: string; link?: string }
>

// Manually declaring all properties as rollup-plugin-dts
// is unable to merge augmented module declarations

export interface MarkdownEnv {
  /**
   * The raw Markdown content without frontmatter
   */
  content?: string
  /**
   * The excerpt that extracted by `@mdit-vue/plugin-frontmatter`
   *
   * - Would be the rendered HTML when `renderExcerpt` is enabled
   * - Would be the raw Markdown when `renderExcerpt` is disabled
   */
  excerpt?: string
  /**
   * The frontmatter that extracted by `@mdit-vue/plugin-frontmatter`
   */
  frontmatter?: Record<string, unknown>
  /**
   * The headers that extracted by `@mdit-vue/plugin-headers`
   */
  headers?: Header[]
  /**
   * SFC blocks that extracted by `@mdit-vue/plugin-sfc`
   */
  sfcBlocks?: MarkdownSfcBlocks
  /**
   * The title that extracted by `@mdit-vue/plugin-title`
   */
  title?: string
  path: string
  relativePath: string
  cleanUrls: boolean
  links?: string[]
  includes?: string[]
  realPath?: string
}
