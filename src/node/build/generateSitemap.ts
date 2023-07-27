import fs from 'fs-extra'
import path from 'path'
import { SitemapStream } from 'sitemap'
import type { SiteConfig } from '../config'
import { getGitTimestamp } from '../utils/getGitTimestamp'
import { task } from '../utils/task'

export async function generateSitemap(siteConfig: SiteConfig) {
  if (!siteConfig.sitemap?.hostname) return
  await task('generating sitemap', async () => {
    const items = (
      await Promise.all(
        siteConfig.pages.map(async (page) => {
          const url = (siteConfig.rewrites.map[page] || page)
            .replace(/(^|\/)?index.md$/, '$1')
            .replace(/\.md$/, siteConfig.cleanUrls ? '' : '.html')
          const lastmod =
            (siteConfig.lastUpdated && (await getGitTimestamp(page))) ||
            undefined
          return { url, lastmod }
        })
      )
    ).sort((a, b) => a.url.localeCompare(b.url))
    const sitemapStream = new SitemapStream(siteConfig.sitemap)
    const writeStream = fs.createWriteStream(
      path.join(siteConfig.outDir, 'sitemap.xml')
    )
    sitemapStream.pipe(writeStream)
    ;((await siteConfig.sitemap?.transformItems?.(items)) || items).forEach(
      (item) => sitemapStream.write(item)
    )
    sitemapStream.end()
  })
}
