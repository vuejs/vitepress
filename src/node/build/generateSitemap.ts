import fs from 'fs-extra'
import path from 'path'
import {
  SitemapStream,
  type EnumChangefreq,
  type Img,
  type LinkItem,
  type NewsItem
} from 'sitemap'
import type { SiteConfig } from '../config'
import { getGitTimestamp } from '../utils/getGitTimestamp'
import { task } from '../utils/task'

export async function generateSitemap(siteConfig: SiteConfig) {
  if (!siteConfig.sitemap?.hostname) return

  const getLastmod = async (url: string) => {
    if (!siteConfig.lastUpdated) return undefined

    let file = url.replace(/(^|\/)$/, '$1index')
    file = file.replace(/(\.html)?$/, '.md')
    file = siteConfig.rewrites.inv[file] || file
    file = path.join(siteConfig.srcDir, file)

    return (await getGitTimestamp(file)) || undefined
  }

  await task('generating sitemap', async () => {
    const locales = siteConfig.userConfig.locales || {}
    const filteredLocales = Object.keys(locales).filter(
      (locale) => locales[locale].lang && locale !== 'root'
    )
    const defaultLang =
      locales?.root?.lang || siteConfig.userConfig.lang || 'en-US'

    const pages = siteConfig.pages.map(
      (page) => siteConfig.rewrites.map[page] || page
    )

    const groupedPages: Record<string, { lang: string; url: string }[]> = {}
    pages.forEach((page) => {
      const locale = page.split('/')[0]
      const lang = locales[locale]?.lang || defaultLang

      let url = page.replace(/(^|\/)index\.md$/, '$1')
      url = url.replace(/\.md$/, siteConfig.cleanUrls ? '' : '.html')
      if (filteredLocales.includes(locale)) page = page.slice(locale.length + 1)

      if (!groupedPages[page]) groupedPages[page] = []
      groupedPages[page].push({ url, lang })
    })

    const _items = await Promise.all(
      Object.values(groupedPages).map(async (pages) => {
        if (pages.length < 2)
          return { url: pages[0].url, lastmod: await getLastmod(pages[0].url) }

        return await Promise.all(
          pages.map(async ({ url }) => {
            return { url, lastmod: await getLastmod(url), links: pages }
          })
        )
      })
    )

    let items: SitemapItem[] = _items.flat()
    items = (await siteConfig.sitemap?.transformItems?.(items)) || items

    const sitemapStream = new SitemapStream(siteConfig.sitemap)
    const sitemapPath = path.join(siteConfig.outDir, 'sitemap.xml')
    const writeStream = fs.createWriteStream(sitemapPath)

    sitemapStream.pipe(writeStream)
    items.forEach((item) => sitemapStream.write(item))
    sitemapStream.end()
  })
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
