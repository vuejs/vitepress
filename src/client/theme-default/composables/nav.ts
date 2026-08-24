import { useMediaQuery, whenever } from '@vueuse/core'
import { useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import {
  computed,
  ref,
  toValue,
  watch,
  type InjectionKey,
  type MaybeRefOrGetter
} from 'vue'

import { isActive } from '../../shared'

export function useNav() {
  const isScreenOpen = ref(false)

  function openScreen() {
    isScreenOpen.value = true
  }

  function closeScreen() {
    isScreenOpen.value = false
  }

  function toggleScreen() {
    isScreenOpen.value ? closeScreen() : openScreen()
  }

  // Close screen when the user resizes the window wider than tablet size.
  const isTablet = useMediaQuery('(min-width: 48rem)')
  whenever(isTablet, closeScreen)

  const route = useRoute()
  watch(() => route.path, closeScreen)

  return {
    isScreenOpen,
    openScreen,
    closeScreen,
    toggleScreen
  }
}

export function useNavItemLink(
  item: MaybeRefOrGetter<DefaultTheme.NavItemWithLink>
) {
  const route = useRoute()

  const href = computed(() => {
    const { link } = toValue(item)
    return typeof link === 'function' ? link(route.data) : link
  })

  const isActiveLink = computed(() => {
    const { activeMatch } = toValue(item)
    return isActive(
      route.data.relativePath,
      route.hash,
      activeMatch || href.value,
      !!activeMatch
    )
  })

  // exact match only — a broad activeMatch keeps the visual active state
  // without claiming aria-current
  const isCurrentLink = computed(() => {
    return isActive(route.data.relativePath, route.hash, href.value)
  })

  return { href, isActiveLink, isCurrentLink }
}

export interface NavExposedMethods {
  closeScreen: () => void
}

export const navInjectionKey: InjectionKey<NavExposedMethods> = Symbol('nav')
