import { useMediaQuery } from '@vueuse/core'
import { onContentUpdated } from 'vitepress'
import { computed, ref, shallowRef, watch } from 'vue'
import type { MenuItem } from '../../shared'
import { getSidebar, getSidebarGroups } from '../support/sidebar'
import { useData } from './data'
import { getHeaders } from './outline'

export function useLayout() {
  const { frontmatter, page, theme } = useData()
  const is960 = useMediaQuery('(min-width: 960px)')

  const isHome = computed(() => {
    return !!(frontmatter.value.isHome ?? frontmatter.value.layout === 'home')
  })

  const _sidebar = computed(() => {
    const sidebarConfig = theme.value.sidebar
    const relativePath = page.value.relativePath
    return sidebarConfig ? getSidebar(sidebarConfig, relativePath) : []
  })

  const sidebar = ref(_sidebar.value)

  watch(_sidebar, (next, prev) => {
    if (JSON.stringify(next) !== JSON.stringify(prev))
      sidebar.value = _sidebar.value
  })

  const hasSidebar = computed(() => {
    return (
      frontmatter.value.sidebar !== false &&
      sidebar.value.length > 0 &&
      !isHome.value
    )
  })

  const leftAside = computed(() => {
    if (!hasAside.value) return false
    return frontmatter.value.aside == null
      ? theme.value.aside === 'left'
      : frontmatter.value.aside === 'left'
  })

  const hasAside = computed(() => {
    if (isHome.value) return false
    if (frontmatter.value.aside != null) return !!frontmatter.value.aside
    return theme.value.aside !== false
  })

  const isSidebarEnabled = computed(() => hasSidebar.value && is960.value)

  const sidebarGroups = computed(() => {
    return hasSidebar.value ? getSidebarGroups(sidebar.value) : []
  })

  const headers = shallowRef<MenuItem[]>([])

  const hasLocalNav = computed(() => {
    return headers.value.length > 0
  })

  onContentUpdated(() => {
    headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline)
  })

  return {
    isHome,
    sidebar,
    sidebarGroups,
    hasSidebar,
    hasAside,
    leftAside,
    isSidebarEnabled,
    headers,
    hasLocalNav
  }
}
