import {
  usePageData,
  useRoute,
  useSiteDataByRoute,
  useSiteData
} from 'vitepress'
import { computed, h, FunctionalComponent, VNode } from 'vue'
import { Header } from '../../../../types/shared'
import { isActive, joinUrl, getPathDirName } from '../utils'
import { DefaultTheme } from '../config'
import { useActiveSidebarLinks } from '../composables/activeSidebarLink'
import NavBarLinks from './NavBarLinks.vue'

const SideBarItem: FunctionalComponent<{
  item: ResolvedSidebarItem
}> = (props) => {
  const {
    item: { link: relLink, text, children }
  } = props

  const route = useRoute()
  const pageData = usePageData()
  const siteData = useSiteData()

  const link = resolveLink(siteData.value.base, relLink || '')
  const active = isActive(route, link)
  const headers = pageData.value.headers

  return h('li', { class: 'sidebar-item' }, [
    createLink(active, text, link),
    createChildren(active, children, headers)
  ])
}

export default {
  components: {
    NavBarLinks,
    SideBarItem
  },

  setup() {
    const pageData = usePageData()
    const siteData = useSiteDataByRoute()
    const route = useRoute()

    useActiveSidebarLinks()

    return {
      items: computed(() => {
        const {
          headers,
          frontmatter: { sidebar, sidebarDepth = 2 }
        } = pageData.value

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

interface HeaderWithChildren extends Header {
  children?: Header[]
}

type ResolvedSidebar = ResolvedSidebarItem[]

interface ResolvedSidebarItem {
  text: string
  link?: string
  isGroup?: boolean
  children?: ResolvedSidebarItem[]
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

function resolveLink(base: string, path: string): string | undefined {
  return path
    ? // keep relative hash to the same page
      path.startsWith('#')
      ? path
      : joinUrl(base, path)
    : undefined
}

function createLink(active: boolean, text: string, link?: string): VNode {
  const tag = link ? 'a' : 'p'

  const component = {
    class: { 'sidebar-link': true, active },
    href: link
  }

  return h(tag, component, text)
}

function createChildren(
  active: boolean,
  children?: ResolvedSidebarItem[],
  headers?: Header[]
): VNode | null {
  if (children && children.length > 0) {
    return h(
      'ul',
      { class: 'sidebar-items' },
      children.map((c) => {
        return h(SideBarItem, { item: c })
      })
    )
  }

  return active && headers
    ? createChildren(false, resolveHeaders(headers))
    : null
}

function resolveHeaders(headers: Header[]): ResolvedSidebarItem[] {
  return mapHeaders(groupHeaders(headers))
}

function groupHeaders(headers: Header[]): HeaderWithChildren[] {
  headers = headers.map((h) => Object.assign({}, h))
  let lastH2: HeaderWithChildren
  headers.forEach((h) => {
    if (h.level === 2) {
      lastH2 = h
    } else if (lastH2) {
      ;(lastH2.children || (lastH2.children = [])).push(h)
    }
  })
  return headers.filter((h) => h.level === 2)
}

function mapHeaders(headers: HeaderWithChildren[]): ResolvedSidebarItem[] {
  return headers.map((header) => ({
    text: header.title,
    link: `#${header.slug}`,
    children: header.children ? mapHeaders(header.children) : undefined
  }))
}
