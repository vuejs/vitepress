import { computed, watch } from 'vue'
import { useInert, useRoute } from 'vitepress'

export function useNav() {
  const inert = useInert()!
  const isScreenOpen = computed(() => inert.isScreenOpen)

  function openScreen() {
    inert.isScreenOpen = true
    window.addEventListener('resize', closeScreenOnTabletWindow)
  }

  function handleCloseScreen(fromRoute = false) {
    if (fromRoute) inert.onAfterRouteChanged()
    else inert.isScreenOpen = false
    window.removeEventListener('resize', closeScreenOnTabletWindow)
  }

  function closeScreen() {
    handleCloseScreen()
  }

  function toggleScreen() {
    isScreenOpen.value ? handleCloseScreen() : openScreen()
  }

  /**
   * Close the screen when the user resizes the window wider than tablet size.
   */
  function closeScreenOnTabletWindow() {
    window.outerWidth >= 768 && handleCloseScreen()
  }

  const route = useRoute()
  watch(
    () => route.path,
    () => handleCloseScreen(true)
  )

  return {
    isScreenOpen,
    openScreen,
    closeScreen,
    toggleScreen
  }
}
