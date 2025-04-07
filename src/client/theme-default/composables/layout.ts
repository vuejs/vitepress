import { useMediaQuery } from '@vueuse/core'
import { onContentUpdated, useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { computed, shallowRef, watch } from 'vue'
import { getSidebar, getSidebarGroups } from '../support/sidebar'
import { useData } from './data'
import { getHeaders } from './outline'
import { useCloseSidebarOnEscape } from './sidebar'

const headers = shallowRef<DefaultTheme.OutlineItem[]>([])

export function useLayout() {
  const { frontmatter, page, theme } = useData()
  const is960 = useMediaQuery('(min-width: 960px)')

  const isHome = computed(() => {
    return !!(frontmatter.value.isHome ?? frontmatter.value.layout === 'home')
  })

  const sidebar = computed(() => {
    const sidebarConfig = theme.value.sidebar
    const relativePath = page.value.relativePath
    return sidebarConfig ? getSidebar(sidebarConfig, relativePath) : []
  })

  const hasSidebar = computed(() => {
    return (
      frontmatter.value.sidebar !== false &&
      sidebar.value.length > 0 &&
      !isHome.value
    )
  })

  const isSidebarEnabled = computed(() => hasSidebar.value && is960.value)

  const sidebarGroups = computed(() => {
    return hasSidebar.value ? getSidebarGroups(sidebar.value) : []
  })

  const hasAside = computed(() => {
    if (isHome.value) return false
    if (frontmatter.value.aside != null) return !!frontmatter.value.aside
    return theme.value.aside !== false
  })

  const leftAside = computed(() => {
    if (!hasAside.value) return false
    return frontmatter.value.aside == null
      ? theme.value.aside === 'left'
      : frontmatter.value.aside === 'left'
  })

  const hasLocalNav = computed(() => {
    return headers.value.length > 0
  })

  return {
    isHome,
    sidebar,
    sidebarGroups,
    hasSidebar,
    isSidebarEnabled,
    hasAside,
    leftAside,
    headers,
    hasLocalNav
  }
}

interface RegisterWatchersOptions {
  closeSidebar: () => void
}

export function registerWatchers({ closeSidebar }: RegisterWatchersOptions) {
  const { frontmatter, theme } = useData()

  onContentUpdated(() => {
    headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline)
  })

  const route = useRoute()
  watch(() => route.path, closeSidebar)

  useCloseSidebarOnEscape(closeSidebar)
}
