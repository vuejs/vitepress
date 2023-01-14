// types shared between server and client
import type { SSRContext } from 'vue/server-renderer'
export type { DefaultTheme } from './default-theme.js'

export type Awaitable<T> = T | PromiseLike<T>

export interface PageData {
  relativePath: string
  title: string
  titleTemplate?: string | boolean
  description: string
  headers: Header[]
  frontmatter: Record<string, any>
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

export type CleanUrlsMode =
  | 'disabled'
  | 'without-subfolders'
  | 'with-subfolders'

export interface SiteData<ThemeConfig = any> {
  base: string
  cleanUrls?: CleanUrlsMode

  /**
   * Language of the site as it should be set on the `html` element.
   *
   * @example `en-US`, `zh-CN`
   */
  lang: string

  title: string
  titleTemplate?: string | boolean
  description: string
  head: HeadConfig[]
  appearance: boolean | 'dark'
  themeConfig: ThemeConfig
  scrollOffset: number | string
  locales: Record<string, LocaleConfig>

  /**
   * Available locales for the site when it has defined `locales` in its
   * `themeConfig`. This object is otherwise empty. Keys are paths like `/` or
   * `/zh/`.
   */
  langs: Record<
    string,
    {
      /**
       * Lang attribute as set on the `<html>` element.
       * @example `en-US`, `zh-CN`
       */
      lang: string
      /**
       * Label to display in the language menu.
       * @example `English`, `简体中文`
       */
      label: string
    }
  >
}

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]

export interface LocaleConfig {
  lang: string
  title?: string
  titleTemplate?: string | boolean
  description?: string
  head?: HeadConfig[]
  label?: string
  selectText?: string
}

export interface PageDataPayload {
  path: string
  pageData: PageData
}

export interface SSGContext extends SSRContext {
  content: string
}
