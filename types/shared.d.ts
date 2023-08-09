// types shared between server and client
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
  frontmatter: OptionalFrontmatter
  params?: Record<string, any>
  isNotFound?: boolean
  lastUpdated?: number
}

// ! This type makes it so that other frontmatter values can be acknowleged when using frontmatter.
type OptionalFrontmatter =
  | FrontMatter
  | Exclude<Record<string, NonNullable<unknown>>, FrontMatter>

// This is the shape of the front matter
//!  Leave the curly braces it makes this type work.
type FrontMatter = {
  navbar: boolean
  sidebar: boolean
  footer: boolean
  lastUpdated: boolean
  editLink: boolean
  aside: boolean | 'left'
  outline: number | [number, number] | 'deep' | false
  pageClass: string
} & (
  | {
      layout: 'home'
      hero: Hero
      features: Array<Feature>
    }
  | { layout: 'doc' }
  | { layout: 'page' }
)

// This type was added to complete the front matter.
interface Feature {
  // Show icon on each feature box.
  icon?: FeatureIcon

  // Title of the feature.
  title: string

  // Details of the feature.
  details: string

  // Link when clicked on feature component. The link can
  // be both internal or external.
  //
  // e.g. `guid/reference/default-theme-home-page` or `htttps://example.com`
  link?: string

  // Link text to be shown inside feature component. Best
  // used with `link` option.
  //
  // e.g. `Learn more`, `Visit page`, etc.
  linkText?: string

  // Link rel attribute for the `link` option.
  //
  // e.g. `external`
  rel?: string
}

type FeatureIcon =
  | string
  | { src: string; alt?: string; width?: string; height: string }
  | {
      light: string
      dark: string
      alt?: string
      width?: string
      height: string
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
  appearance: boolean | 'dark'
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
