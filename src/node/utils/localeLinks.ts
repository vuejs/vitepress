import path from 'node:path'

import type { SiteConfig } from '../siteConfig'
import { getLocaleForPath, isExternal, type PageData } from '../shared'

const pageSets = new WeakMap<string[], Set<string>>()

export function resolveLocaleLinks(
  { site, pages, rewrites }: SiteConfig,
  sourcePath: string,
  relativePath: string
): PageData['localeLinks'] {
  const locales = Object.entries(site.locales)
  if (locales.length < 2) return

  let pageSet = pageSets.get(pages)
  if (!pageSet) {
    pageSet = new Set(pages)
    pageSets.set(pages, pageSet)
  }
  if (!pageSet.has(sourcePath)) return

  const currentLocale = getLocaleForPath(site, relativePath)
  const sourceLocale = getLocaleForPath(site, sourcePath)
  const pagePath = stripLocale(relativePath, currentLocale)
  const sourcePagePath = stripLocale(sourcePath, sourceLocale)
  const links: NonNullable<PageData['localeLinks']> = Object.create(null)

  for (const [locale, config] of locales) {
    if (
      locale === currentLocale ||
      (config.link && (isExternal(config.link) || pagePath === 'index.md'))
    ) {
      continue
    }
    const prefix = locale === 'root' ? '' : `${locale}/`
    const findPage = (candidate: string) => {
      if (Object.hasOwn(rewrites.inv, candidate)) return candidate
      if (pageSet.has(candidate)) {
        const destination = rewrites.map[candidate] ?? candidate
        if (getLocaleForPath(site, destination) === locale) return destination
      }
    }
    const exact =
      findPage(prefix + pagePath) ?? findPage(prefix + sourcePagePath)
    if (exact) {
      links[locale] = { path: exact, exact: true }
      continue
    }

    let directory = path.posix.dirname(pagePath)
    while (directory !== '.') {
      const landing = findPage(`${prefix}${directory}/index.md`)
      if (landing) {
        links[locale] = { path: landing, exact: false }
        break
      }
      directory = path.posix.dirname(directory)
    }

    if (!links[locale] && !config.link) {
      const home = findPage(`${prefix}index.md`)
      if (home) links[locale] = { path: home, exact: false }
    }
  }

  return links
}

function stripLocale(page: string, locale: string): string {
  return locale === 'root' ? page : page.slice(locale.length + 1)
}
