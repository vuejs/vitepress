import type { DefaultTheme } from 'vitepress/theme'
import { ensureStartingSlash } from './utils.js'

/**
 * Get the `Sidebar` from sidebar option. This method will ensure to get correct
 * sidebar config from `MultiSideBarConfig` with various path combinations such
 * as matching `guide/` and `/guide/`. If no matching config was found, it will
 * return empty array.
 */
export function getSidebar(
  sidebar: DefaultTheme.Sidebar | undefined,
  path: string
): DefaultTheme.SidebarGroup[] {
  if (Array.isArray(sidebar)) {
    return sidebar
  }

  if (sidebar == null) {
    return []
  }

  path = ensureStartingSlash(path)

  const dir = Object.keys(sidebar)
    .sort((a, b) => {
      return b.split('/').length - a.split('/').length
    })
    .find((dir) => {
      // make sure the multi sidebar key starts with slash too
      return path.startsWith(ensureStartingSlash(dir))
    })

  return dir ? sidebar[dir] : []
}

export function getFlatSideBarLinks(sidebar: DefaultTheme.SidebarGroup[]) {
  const links: { text: string; link: string }[] = []

  function recursivelyExtractLinks(items: DefaultTheme.SidebarItem[]) {
    for (const item of items) {
      if (item.link) {
        links.push({ ...item, link: item.link })
      }
      if ('items' in item) {
        recursivelyExtractLinks(item.items)
      }
    }
  }

  for (const group of sidebar) {
    recursivelyExtractLinks(group.items)
  }
  return links
}
