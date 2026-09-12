import { useMediaQuery } from '@vueuse/core'
import { onContentUpdated, useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import {
  computed,
  shallowReadonly,
  shallowRef,
  watch,
  type ComputedRef,
  type InjectionKey
} from 'vue'

import { getSidebar, getSidebarGroups } from '../support/sidebar'
import { useData } from './data'
import { getHeaders } from './outline'
import { useCloseSidebarOnEscape } from './sidebar'

const headers = shallowRef<DefaultTheme.OutlineItem[]>([])
const sidebar = shallowRef<DefaultTheme.SidebarItem[]>([])

const isDesktop = useMediaQuery('(min-width: 60rem)')

export function useLayout(): DefaultTheme.Layout {
  const { frontmatter, page, theme } = useData()

  // a not-found page reads like a doc page without the doc chrome; the one
  // synthesized from the theme's `NotFound` component has no prose to style
  const isNotFound = computed(() => !!page.value.isNotFound)

  const layout = computed<string>(() => {
    return (
      frontmatter.value.layout ||
      (isNotFound.value && !page.value.filePath ? 'page' : 'doc')
    )
  })

  const isHome = computed(() => {
    return !!(frontmatter.value.isHome ?? layout.value === 'home')
  })

  const hasSidebar = computed(() => {
    return (
      (frontmatter.value.sidebar ?? !isNotFound.value) !== false &&
      sidebar.value.length > 0 &&
      !isHome.value
    )
  })

  const isSidebarEnabled = computed(() => hasSidebar.value && isDesktop.value)

  const sidebarGroups = computed(() => {
    return hasSidebar.value ? getSidebarGroups(sidebar.value) : []
  })

  const hasAside = computed(() => {
    if (isHome.value) return false
    const aside = frontmatter.value.aside ?? (isNotFound.value ? false : null)
    if (aside != null) return !!aside
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
    layout,
    isHome,
    sidebar: shallowReadonly(sidebar),
    sidebarGroups,
    hasSidebar,
    isSidebarEnabled,
    hasAside,
    leftAside,
    headers: shallowReadonly(headers),
    hasLocalNav
  }
}

interface RegisterWatchersOptions {
  closeSidebar: () => void
}

export function registerWatchers({ closeSidebar }: RegisterWatchersOptions) {
  const { theme, page, frontmatter } = useData()

  watch(
    () => [page.value.relativePath, theme.value.sidebar] as const,
    ([relativePath, sidebarConfig]) => {
      const newSidebar = sidebarConfig
        ? getSidebar(sidebarConfig, relativePath)
        : []
      if (JSON.stringify(newSidebar) !== JSON.stringify(sidebar.value)) {
        sidebar.value = newSidebar
      }
    },
    { immediate: true, deep: true, flush: 'sync' }
  )

  onContentUpdated(() => {
    headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline)
  })

  const route = useRoute()
  watch(() => route.path, closeSidebar)

  watch(isDesktop, closeSidebar)
  useCloseSidebarOnEscape(closeSidebar)
}

export interface LayoutInfo {
  heroImageSlotExists: ComputedRef<boolean>
}

export const layoutInfoInjectionKey: InjectionKey<LayoutInfo> =
  Symbol('layout-info')
