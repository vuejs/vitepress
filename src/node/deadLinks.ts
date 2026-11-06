import fs from 'fs-extra'
import path from 'node:path'
import type { SiteConfig } from './config'
import { EXTERNAL_URL_RE, isExternal, slash, treatAsHtml } from './shared'

export interface DeadLink {
  url: string
  file: string
  line?: number
}

interface SidebarLink {
  url: string
  file: string
}

function shouldIgnoreDeadLink(
  url: string,
  file: string,
  siteConfig: SiteConfig
) {
  if (!siteConfig.ignoreDeadLinks) {
    return false
  }
  if (siteConfig.ignoreDeadLinks === true) {
    return true
  }
  if (siteConfig.ignoreDeadLinks === 'localhostLinks') {
    return url.replace(EXTERNAL_URL_RE, '').startsWith('//localhost')
  }

  return siteConfig.ignoreDeadLinks.some((ignore) => {
    if (typeof ignore === 'string') return url === ignore
    if (ignore instanceof RegExp) return ignore.test(url)
    if (typeof ignore === 'function') return ignore(url, file)
    return false
  })
}

function applySidebarBase(link: string, base?: string) {
  if (!base || isExternal(link)) return link
  return base + link.replace(/^\//, base.endsWith('/') ? '' : '/')
}

function collectSidebarLinks(
  sidebar: unknown,
  file: string,
  links: SidebarLink[],
  base?: string
) {
  if (Array.isArray(sidebar)) {
    for (const item of sidebar) {
      if (!item || typeof item !== 'object') continue

      const sidebarItem = item as {
        base?: string
        link?: string
        items?: unknown
      }
      const itemBase = sidebarItem.base || base

      if (typeof sidebarItem.link === 'string') {
        links.push({
          url: applySidebarBase(sidebarItem.link, itemBase),
          file
        })
      }

      collectSidebarLinks(sidebarItem.items, file, links, itemBase)
    }
    return
  }

  if (sidebar && typeof sidebar === 'object') {
    for (const value of Object.values(sidebar)) {
      if (Array.isArray(value)) {
        collectSidebarLinks(value, file, links)
      } else if (value && typeof value === 'object') {
        const group = value as { base?: string; items?: unknown }
        collectSidebarLinks(group.items, file, links, group.base)
      }
    }
  }
}

function resolveInternalLink(
  rawUrl: string,
  dir: string,
  publicDir: string,
  siteConfig: SiteConfig
) {
  if (
    EXTERNAL_URL_RE.test(rawUrl) ||
    rawUrl.startsWith('#') ||
    rawUrl.startsWith('?')
  ) {
    return
  }

  let url = rawUrl
  const { pathname } = new URL(url, 'http://a.com')
  if (!treatAsHtml(pathname)) return

  url = url.replace(/[?#].*$/, '').replace(/\.(html|md)$/, '')
  if (url.endsWith('/')) url += `index`

  let resolved = decodeURIComponent(
    slash(
      url.startsWith('/')
        ? url.slice(1)
        : path.relative(siteConfig.srcDir, path.resolve(dir, url))
    )
  )
  resolved = siteConfig.rewrites.inv[resolved + '.md']?.slice(0, -3) || resolved

  if (
    !siteConfig.pages
      .map((p) => slash(p.replace(/\.md$/, '')))
      .includes(resolved) &&
    !fs.existsSync(path.resolve(dir, publicDir, `${resolved}.html`)) &&
    !shouldIgnoreDeadLink(
      url,
      siteConfig.configPath || siteConfig.srcDir,
      siteConfig
    )
  ) {
    return url
  }
}

export function findSidebarDeadLinks(
  siteConfig: SiteConfig,
  publicDir: string
): DeadLink[] {
  const sidebar = siteConfig.site.themeConfig?.sidebar
  if (!sidebar || siteConfig.ignoreDeadLinks === true) return []

  const file = siteConfig.configPath || siteConfig.srcDir
  const links: SidebarLink[] = []
  collectSidebarLinks(sidebar, file, links)

  return links.flatMap(({ url, file }) => {
    const deadUrl = resolveInternalLink(
      url,
      siteConfig.srcDir,
      publicDir,
      siteConfig
    )
    return deadUrl ? [{ url: deadUrl, file }] : []
  })
}
