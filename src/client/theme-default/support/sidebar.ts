import type { DefaultTheme } from 'vitepress/theme'
import { ensureStartingSlash } from './utils'

/**
 * Get the `Sidebar` from sidebar option. This method will ensure to get correct
 * sidebar config from `MultiSideBarConfig` with various path combinations such
 * as matching `guide/` and `/guide/`. If no matching config was found, it will
 * return empty array.
 */
export function getSidebar(
  sidebar: DefaultTheme.Sidebar,
  path: string
): DefaultTheme.SidebarGroup[] {
  if (Array.isArray(sidebar)) {
    return sidebar
  }

  path = ensureStartingSlash(path)

  for (const dir in sidebar) {
    // make sure the multi sidebar key starts with slash too
    if (path.startsWith(ensureStartingSlash(dir))) {
      return sidebar[dir]
    }
  }

  return []
}

export function getFlatSideBarLinks(
  sidebar: DefaultTheme.SidebarGroup[]
): DefaultTheme.SidebarItem[] {
  const links: DefaultTheme.SidebarItem[] = []

  for (const group of sidebar) {
    // make sure sidebar entry didn't config the items property without build error
    if (!group.items || !Array.isArray(group.items)) {
      continue
    }
    /**
     * the group.items need to be checked if items didn't be configed
     * 
     * Alternatively, document `items` as required, even if it will be an empty array in the Config-Docs page
     * 
     * in `.vitepress/config.[ts/js]` like this will throw error:
     * {
     *    siderbar: [
     *        '/mood/': [
     *            {
     *              text: 'Mood Index'
     *            }
     *        ]
     *    ]
     * }
     */
    for (const link of group.items) {
      links.push(link)
    }
  }

  return links
}
