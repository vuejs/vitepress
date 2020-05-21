// types shared between server and client.

export interface SiteData<ThemeConfig = any> {
  title: string
  description: string
  base: string
  head: HeadConfig[]
  themeConfig: ThemeConfig
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
