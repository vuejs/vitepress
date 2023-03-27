import {
  type ComputedRef,
  type Ref,
  computed,
  onMounted,
  onUnmounted,
  ref,
  watchEffect
} from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { isActive } from '../support/utils'
import {
  hasActiveLink as containsActiveLink,
  getSidebar,
  getSidebarGroups
} from '../support/sidebar'
import { useData } from './data'

export interface SidebarControl {
  collapsed: Ref<boolean>
  collapsible: ComputedRef<boolean>
  isLink: ComputedRef<boolean>
  isActiveLink: ComputedRef<boolean>
  hasActiveLink: ComputedRef<boolean>
  hasChildren: ComputedRef<boolean>
  toggle(): void
}

export function useSidebar() {
  const route = useRoute()
  const { theme, frontmatter } = useData()
  const is960 = useMediaQuery('(min-width: 960px)')

  const isOpen = ref(false)

  const sidebar = computed(() => {
    const sidebarConfig = theme.value.sidebar
    const relativePath = route.data.relativePath
    return sidebarConfig ? getSidebar(sidebarConfig, relativePath) : []
  })

  const hasSidebar = computed(() => {
    return (
      frontmatter.value.sidebar !== false &&
      sidebar.value.length > 0 &&
      frontmatter.value.layout !== 'home'
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
    if (frontmatter.value.layout === 'home') return false
    if (frontmatter.value.aside != null) return !!frontmatter.value.aside
    if (theme.value.aside === false) return false
    return true
  })

  const isSidebarEnabled = computed(() => hasSidebar.value && is960.value)

  const sidebarGroups = computed(() => {
    return hasSidebar.value ? getSidebarGroups(sidebar.value) : []
  })

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value ? close() : open()
  }

  return {
    isOpen,
    sidebar,
    sidebarGroups,
    hasSidebar,
    hasAside,
    leftAside,
    isSidebarEnabled,
    open,
    close,
    toggle
  }
}

/**
 * a11y: cache the element that opened the Sidebar (the menu button) then
 * focus that button again when Menu is closed with Escape key.
 */
export function useCloseSidebarOnEscape(
  isOpen: Ref<boolean>,
  close: () => void
) {
  let triggerElement: HTMLButtonElement | undefined

  watchEffect(() => {
    triggerElement = isOpen.value
      ? (document.activeElement as HTMLButtonElement)
      : undefined
  })

  onMounted(() => {
    window.addEventListener('keyup', onEscape)
  })

  onUnmounted(() => {
    window.removeEventListener('keyup', onEscape)
  })

  function onEscape(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen.value) {
      close()
      triggerElement?.focus()
    }
  }
}

export function useSidebarControl(
  item: ComputedRef<DefaultTheme.SidebarItem>
): SidebarControl {
  const { page } = useData()

  const collapsed = ref(false)

  const collapsible = computed(() => {
    return item.value.collapsed != null
  })

  const isLink = computed(() => {
    return !!item.value.link
  })

  const isActiveLink = computed(() => {
    return isActive(page.value.relativePath, item.value.link)
  })

  const hasActiveLink = computed(() => {
    if (isActiveLink.value) {
      return true
    }

    return item.value.items
      ? containsActiveLink(page.value.relativePath, item.value.items)
      : false
  })

  const hasChildren = computed(() => {
    return !!(item.value.items && item.value.items.length)
  })

  watchEffect(() => {
    collapsed.value = !!(collapsible.value && item.value.collapsed)
  })

  watchEffect(() => {
    ;(isActiveLink.value || hasActiveLink.value) && (collapsed.value = false)
  })

  function toggle() {
    if (collapsible.value) {
      collapsed.value = !collapsed.value
    }
  }

  return {
    collapsed,
    collapsible,
    isLink,
    isActiveLink,
    hasActiveLink,
    hasChildren,
    toggle
  }
}
