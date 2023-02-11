import type { DefaultTheme } from 'vitepress/theme'
import { ensureStartingSlash, isActive } from './utils.js'

export interface SidebarLink {
  text: string
  link: string
}

/**
 * Get the `Sidebar` from sidebar option. This method will ensure to get correct
 * sidebar config from `MultiSideBarConfig` with various path combinations such
 * as matching `guide/` and `/guide/`. If no matching config was found, it will
 * return empty array.
 */
export function getSidebar(
  sidebar: DefaultTheme.Sidebar | undefined,
  path: string
): DefaultTheme.SidebarItem[] {
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

/**
 * Get or generate sidebar group from the given sidebar items.
 */
export function getSidebarGroups(
  sidebar: DefaultTheme.SidebarItem[]
): DefaultTheme.SidebarItem[] {
  const groups: DefaultTheme.SidebarItem[] = []

  let lastGroupIndex: number = 0

  for (const index in sidebar) {
    const item = sidebar[index]

    if (item.items) {
      lastGroupIndex = groups.push(item)
      continue
    }

    if (!groups[lastGroupIndex]) {
      groups.push({ items: [] })
    }

    groups[lastGroupIndex]!.items!.push(item)
  }

  return groups
}

export function getFlatSideBarLinks(
  sidebar: DefaultTheme.SidebarItem[]
): SidebarLink[] {
  const links: SidebarLink[] = []

  function recursivelyExtractLinks(items: DefaultTheme.SidebarItem[]) {
    for (const item of items) {
      if (item.text && item.link) {
        links.push({ text: item.text, link: item.link })
      }

      if (item.items) {
        recursivelyExtractLinks(item.items)
      }
    }
  }

  recursivelyExtractLinks(sidebar)

  return links
}

/**
 * Check if the given sidebar item contains any active link.
 */
export function hasActiveLink(
  path: string,
  items: DefaultTheme.SidebarItem | DefaultTheme.SidebarItem[]
): boolean {
  if (Array.isArray(items)) {
    return items.some((item) => hasActiveLink(path, item))
  }

  return isActive(path, items.link)
    ? true
    : items.items
    ? hasActiveLink(path, items.items)
    : false
}
