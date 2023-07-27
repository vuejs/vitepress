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

  await task('generating sitemap', async () => {
    let items: SitemapItem[] = await Promise.all(
      siteConfig.pages.map(async (page) => {
        //
        let url = siteConfig.rewrites.map[page] || page
        url = url.replace(/(^|\/)?index.md$/, '$1')
        url = url.replace(/\.md$/, siteConfig.cleanUrls ? '' : '.html')

        const lastmod = siteConfig.lastUpdated && (await getGitTimestamp(page))
        return lastmod ? { url, lastmod } : { url }
      })
    )
    items = items.sort((a, b) => a.url.localeCompare(b.url))
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
