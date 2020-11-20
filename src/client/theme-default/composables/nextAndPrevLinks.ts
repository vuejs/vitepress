import { computed } from 'vue'
import { useSiteDataByRoute, usePageData } from 'vitepress'
import { isArray, getPathDirName, ensureStartingSlash } from '../utils'
import { DefaultTheme } from '../config'

export function useNextAndPrevLinks() {
  const site = useSiteDataByRoute()
  const page = usePageData()

  const candidates = computed(() => {
    const path = ensureStartingSlash(page.value.relativePath)
    const sidebar = site.value.themeConfig.sidebar

    return getFlatSidebarLinks(path, sidebar)
  })

  const currentPath = computed(() => {
    const path = ensureStartingSlash(page.value.relativePath)

    return path.replace(/(index)?\.(md|html)$/, '')
  })

  const currentIndex = computed(() => {
    return candidates.value.findIndex((item) => {
      return item.link === currentPath.value
    })
  })

  const next = computed(() => {
    if (
      site.value.themeConfig.nextLinks !== false &&
      currentIndex.value > -1 &&
      currentIndex.value < candidates.value.length - 1
    ) {
      return candidates.value[currentIndex.value + 1]
    }
  })

  const prev = computed(() => {
    if (site.value.themeConfig.prevLinks !== false && currentIndex.value > 0) {
      return candidates.value[currentIndex.value - 1]
    }
  })

  const hasLinks = computed(() => !!next.value || !!prev.value)

  return {
    next,
    prev,
    hasLinks
  }
}

function getFlatSidebarLinks(
  path: string,
  sidebar?: DefaultTheme.SideBarConfig
): DefaultTheme.SideBarLink[] {
  if (!sidebar || sidebar === 'auto') {
    return []
  }

  return isArray(sidebar)
    ? getFlatSidebarLinksFromArray(path, sidebar)
    : getFlatSidebarLinksFromObject(path, sidebar)
}

function getFlatSidebarLinksFromArray(
  path: string,
  sidebar: DefaultTheme.SideBarItem[]
): DefaultTheme.SideBarLink[] {
  return sidebar.reduce<DefaultTheme.SideBarLink[]>((links, item) => {
    if (item.link) {
      links.push({ text: item.text, link: item.link })
    }

    if (isSideBarGroup(item)) {
      links = [...links, ...getFlatSidebarLinks(path, item.children)]
    }

    return links
  }, [])
}

function getFlatSidebarLinksFromObject(
  path: string,
  sidebar: DefaultTheme.MultiSideBarConfig
): DefaultTheme.SideBarLink[] {
  const paths = [path, Object.keys(sidebar)[0]]
  const item = paths.map((p) => sidebar[getPathDirName(p)]).find(Boolean)

  if (isArray(item)) {
    return getFlatSidebarLinksFromArray(path, item)
  }

  return []
}

function isSideBarGroup(
  item: DefaultTheme.SideBarItem
): item is DefaultTheme.SideBarGroup {
  return (item as DefaultTheme.SideBarGroup).children !== undefined
}
