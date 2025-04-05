import { useMediaQuery } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { getSidebar, getSidebarGroups } from '../support/sidebar'
import { useData } from './data'

export function useLayout() {
  const { frontmatter, page, theme } = useData()
  const is960 = useMediaQuery('(min-width: 960px)')

  const isHome = computed(() => {
    if (frontmatter.value.isHome !== undefined)
      return Boolean(frontmatter.value.isHome)
    else return frontmatter.value.layout === 'home'
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
    if (hasAside)
      return frontmatter.value.aside == null
        ? theme.value.aside === 'left'
        : frontmatter.value.aside === 'left'
    return false
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

  return {
    isHome,
    sidebar,
    sidebarGroups,
    hasSidebar,
    hasAside,
    leftAside,
    isSidebarEnabled
  }
}
