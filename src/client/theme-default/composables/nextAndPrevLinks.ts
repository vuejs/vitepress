import { computed } from 'vue'
import { useSiteDataByRoute, usePageData } from 'vitepress'
import { DefaultTheme } from '../config'

export function useNextAndPrevLinks() {
  const site = useSiteDataByRoute()
  const page = usePageData()

  const candidates = computed(() => {
    return getFlatSidebarLinks(site.value.themeConfig?.sidebar)
  })

  const currentPath = computed(() => {
    return '/' + page.value.relativePath.replace(/(index)?\.(md|html)$/, '')
  })

  const currentIndex = computed(() => {
    return candidates.value.findIndex((item) => {
      return item.link === currentPath.value
    })
  })

  const next = computed(() => {
    if (
      site.value.themeConfig?.nextLinks !== false &&
      currentIndex.value > -1 &&
      currentIndex.value < candidates.value.length - 1
    ) {
      return candidates.value[currentIndex.value + 1]
    }
  })

  const prev = computed(() => {
    if (site.value.themeConfig?.prevLinks !== false && currentIndex.value > 0) {
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
  sidebar?: DefaultTheme.SideBarConfig
): DefaultTheme.SideBarLink[] {
  if (!sidebar || sidebar === 'auto') {
    return []
  }

  return sidebar.reduce<DefaultTheme.SideBarLink[]>((links, item) => {
    if (item.link) {
      links.push({ text: item.text, link: item.link })
    }

    if ((item as DefaultTheme.SideBarGroup).children) {
      links = [
        ...links,
        ...getFlatSidebarLinks((item as DefaultTheme.SideBarGroup).children)
      ]
    }

    return links
  }, [])
}
