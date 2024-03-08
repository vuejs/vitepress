import { ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import { inertControls } from './inert'
import { useMediaQuery } from '@vueuse/core'

export function useNav() {
  const is768 = useMediaQuery('(min-width: 768px)')
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

  watch(is768, (mq) => {
    if (mq) {
      isScreenOpen.value = false
    }
  })

  watch(
    () => [isScreenOpen.value, is768.value],
    ([screenOpen, mq]) => {
      if (mq) {
        inertControls.isScreenOpen = false
      } else {
        inertControls.isScreenOpen = screenOpen
      }
    },
    { immediate: true }
  )

  const route = useRoute()
  watch(() => route.path, closeScreen)

  return {
    isScreenOpen,
    openScreen,
    closeScreen,
    toggleScreen
  }
}
