import { computed, watch } from 'vue'
import { useInert, useRoute } from 'vitepress'

export function useNav() {
  const inert = useInert()!
  const isScreenOpen = computed(() => inert.isScreenOpen)

  function openScreen() {
    inert.isScreenOpen = true
    window.addEventListener('resize', closeScreenOnTabletWindow)
  }

  function closeScreen() {
    inert.isScreenOpen = false
    window.removeEventListener('resize', closeScreenOnTabletWindow)
  }

  function toggleScreen() {
    isScreenOpen.value ? closeScreen() : openScreen()
  }

  /**
   * Close the screen when the user resizes the window wider than tablet size.
   */
  function closeScreenOnTabletWindow() {
    window.outerWidth >= 768 && closeScreen()
  }

  const route = useRoute()
  watch(() => route.path, closeScreen)

  return {
    isScreenOpen,
    openScreen,
    closeScreen,
    toggleScreen
  }
}
