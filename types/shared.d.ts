// types shared between server and client.

export interface LocaleConfig {
  lang: string
  title?: string
  description?: string
  head?: HeadConfig[]
}

export interface SiteData<ThemeConfig = any> {
  lang: string
  title: string
  description: string
  base: string
  head: HeadConfig[]
  themeConfig: ThemeConfig
  locales: Record<string, LocaleConfig>
}

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]

export interface PageData {
  title: string
  frontmatter: Record<string, any>
  headers: Header[]
  lastUpdated: number
}

export interface Header {
  level: number
  title: string
  slug: string
}
