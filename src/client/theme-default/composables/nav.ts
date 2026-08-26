import { useMediaQuery, whenever } from '@vueuse/core'
import { inBrowser, useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import {
  computed,
  ref,
  shallowRef,
  toValue,
  watch,
  type InjectionKey,
  type MaybeRefOrGetter
} from 'vue'

import { isActive } from '../../shared'
import { useData } from './data'

// module-scoped so Layout.vue can render the rest of the app inert while the
// screen (mobile drawer) is open, without threading props through VPNav
const isScreenOpen = ref(false)

// the button that toggles the screen — focus returns to it when the screen
// is closed with Escape
const screenTriggerEl = shallowRef<HTMLButtonElement | null>(null)

function openScreen() {
  isScreenOpen.value = true
}

function closeScreen() {
  isScreenOpen.value = false
}

function toggleScreen() {
  isScreenOpen.value ? closeScreen() : openScreen()
}

let watchersRegistered = false

export function useNav() {
  // the auto-close watchers are app-wide, so guard against VPNav being
  // mounted more than once (the flag persists across SSG renders, hence the
  // inBrowser check — the watchers are meaningless during SSR anyway)
  if (inBrowser && !watchersRegistered) {
    watchersRegistered = true

    // Close screen when the user resizes the window wider than tablet size.
    const isTablet = useMediaQuery('(min-width: 48rem)')
    whenever(isTablet, closeScreen)

    const route = useRoute()
    watch(() => route.path, closeScreen)
  }

  return {
    isScreenOpen,
    screenTriggerEl,
    openScreen,
    closeScreen,
    toggleScreen
  }
}

// whether the theme shows a light/dark switch (guard shared by the inline
// switch, the `⋯` menu and the nav screen)
export function useAppearanceSwitch() {
  const { site } = useData()
  return computed(
    () =>
      !!site.value.appearance &&
      site.value.appearance !== 'force-dark' &&
      site.value.appearance !== 'force-auto'
  )
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

// true within the VPNavScreen subtree — shared components (VPMenuLink,
// VPMenuGroup, …) restyle themselves and close the screen on navigation
export const navScreenInjectionKey: InjectionKey<boolean> = Symbol('nav-screen')
