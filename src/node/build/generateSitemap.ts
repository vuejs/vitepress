import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import {
  SitemapStream,
  type EnumChangefreq,
  type Img,
  type LinkItem,
  type NewsItem
} from 'sitemap'
import type { SiteConfig } from '../config'
import type { PageMeta } from '../plugin'

export async function generateSitemap(
  siteConfig: SiteConfig,
  pageMetaMap: Record<string, PageMeta>
) {
  const locales = siteConfig.userConfig.locales || {}
  const defaultLang =
    locales.root?.lang || siteConfig.userConfig.lang || 'en-US'

  // locale directories whose pages are translations of each other
  const localeDirs = Object.keys(locales).filter(
    (locale) => locale !== 'root' && locales[locale].lang
  )

  // group each page with its translations under a locale-independent key
  const pageGroups: Record<
    string,
    { lang: string; url: string; lastmod?: number }[]
  > = {}

  for (const sourcePage of siteConfig.pages) {
    const page = siteConfig.rewrites.map[sourcePage] || sourcePage
    const localeDir = page.split('/')[0]

    const url = page
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, siteConfig.cleanUrls ? '' : '.html')

    const key = localeDirs.includes(localeDir)
      ? page.slice(localeDir.length + 1)
      : page

    ;(pageGroups[key] ??= []).push({
      lang: locales[localeDir]?.lang || defaultLang,
      url,
      lastmod: pageMetaMap[page]?.lastUpdated || undefined
    })
  }

  // translated pages link to all their variants (including themselves)
  let items: SitemapItem[] = Object.values(pageGroups).flatMap((variants) =>
    variants.length < 2
      ? { url: variants[0].url, lastmod: variants[0].lastmod }
      : variants.map(({ url, lastmod }) => ({
          url,
          lastmod,
          links: variants
        }))
  )
  items = (await siteConfig.sitemap?.transformItems?.(items)) || items

  const sitemapPath = path.join(siteConfig.outDir, 'sitemap.xml')
  const sitemapStream = new SitemapStream(siteConfig.sitemap)

  items.forEach((item) => sitemapStream.write(item))
  sitemapStream.end()
  await pipeline(sitemapStream, fs.createWriteStream(sitemapPath))
}

// ============================== Patched Types ===============================

export interface SitemapItem {
  lastmod?: string | number | Date
  changefreq?: `${EnumChangefreq}`
  fullPrecisionPriority?: boolean
  priority?: number
  news?: NewsItem
  expires?: string
  androidLink?: string
  ampLink?: string
  url: string
  video?: any
  img?: string | Img | (string | Img)[]
  links?: LinkItem[]
  lastmodfile?: string | Buffer | URL
  lastmodISO?: string
  lastmodrealtime?: boolean
}
