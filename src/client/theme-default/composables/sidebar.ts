import type { DefaultTheme } from 'vitepress/theme'
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
  watchEffect,
  watchPostEffect,
  type ComputedRef
} from 'vue'
import { isActive } from '../../shared'
import { hasActiveLink as containsActiveLink } from '../support/sidebar'
import { useData } from './data'

const isOpen = ref(false)

/**
 * a11y: cache the element that opened the Sidebar (the menu button) then
 * focus that button again when Menu is closed with Escape key.
 */
export function useCloseSidebarOnEscape(close: () => void) {
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

export function useSidebarControl() {
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
    open,
    close,
    toggle
  }
}

export function useSidebarItemControl(
  item: ComputedRef<DefaultTheme.SidebarItem>
) {
  const { page, hash } = useData()

  const collapsed = ref(false)

  const collapsible = computed(() => {
    return item.value.collapsed != null
  })

  const isLink = computed(() => {
    return !!item.value.link
  })

  const isActiveLink = ref(false)
  const updateIsActiveLink = () => {
    isActiveLink.value = isActive(page.value.relativePath, item.value.link)
  }

  watch([page, item, hash], updateIsActiveLink)
  onMounted(updateIsActiveLink)

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

  watchPostEffect(() => {
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
