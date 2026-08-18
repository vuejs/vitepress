import { useMediaQuery, whenever } from '@vueuse/core'
import { useRoute } from 'vitepress'
import { ref, watch, type InjectionKey } from 'vue'

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

export interface NavExposedMethods {
  closeScreen: () => void
}

export const navInjectionKey: InjectionKey<NavExposedMethods> = Symbol('nav')
