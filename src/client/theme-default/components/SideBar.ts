import { useRoute, useSiteDataByRoute } from 'vitepress'
import { computed } from 'vue'
import { Header } from '../../../../types/shared'
import { getPathDirName } from '../utils'
import { DefaultTheme } from '../config'
import { useActiveSidebarLinks } from '../composables/activeSidebarLink'
import NavBarLinks from './NavBarLinks.vue'
import { SideBarItem } from './SideBarItem'

export interface ResolvedSidebarItem {
  text: string
  link?: string
  isGroup?: boolean
  children?: ResolvedSidebarItem[]
}

type ResolvedSidebar = ResolvedSidebarItem[]

export default {
  components: {
    NavBarLinks,
    SideBarItem
  },

  setup() {
    const route = useRoute()
    const siteData = useSiteDataByRoute()

    useActiveSidebarLinks()

    return {
      items: computed(() => {
        const {
          headers,
          frontmatter: { sidebar, sidebarDepth = 2 }
        } = route.data

        if (sidebar === 'auto') {
          // auto, render headers of current page
          return resolveAutoSidebar(headers, sidebarDepth)
        } else if (Array.isArray(sidebar)) {
          // in-page array config
          return resolveArraySidebar(sidebar, sidebarDepth)
        } else if (sidebar === false) {
          return []
        } else {
          // no explicit page sidebar config
          // check global theme config
          const { sidebar: themeSidebar } = siteData.value.themeConfig
          if (themeSidebar === 'auto') {
            return resolveAutoSidebar(headers, sidebarDepth)
          } else if (Array.isArray(themeSidebar)) {
            return resolveArraySidebar(themeSidebar, sidebarDepth)
          } else if (themeSidebar === false) {
            return []
          } else if (typeof themeSidebar === 'object') {
            return resolveMultiSidebar(
              themeSidebar,
              route.path,
              headers,
              sidebarDepth
            )
          }
        }
      })
    }
  }
}

function resolveAutoSidebar(headers: Header[], depth: number): ResolvedSidebar {
  const ret: ResolvedSidebar = []

  if (headers === undefined) {
    return []
  }

  let lastH2: ResolvedSidebarItem | undefined = undefined
  headers.forEach(({ level, title, slug }) => {
    if (level - 1 > depth) {
      return
    }

    const item: ResolvedSidebarItem = {
      text: title,
      link: `#${slug}`
    }
    if (level === 2) {
      lastH2 = item
      ret.push(item)
    } else if (lastH2) {
      ;(lastH2.children || (lastH2.children = [])).push(item)
    }
  })

  return ret
}

function resolveArraySidebar(
  config: DefaultTheme.SideBarItem[],
  depth: number
): ResolvedSidebar {
  return config
}

function resolveMultiSidebar(
  config: DefaultTheme.MultiSideBarConfig,
  path: string,
  headers: Header[],
  depth: number
): ResolvedSidebar {
  const paths = [path, Object.keys(config)[0]]
  const item = paths.map((x) => config[getPathDirName(x)]).find(Boolean)

  if (Array.isArray(item)) {
    return resolveArraySidebar(item, depth)
  }

  if (item === 'auto') {
    return resolveAutoSidebar(headers, depth)
  }

  return []
}
