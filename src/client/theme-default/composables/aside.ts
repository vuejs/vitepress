import { computed, onMounted, onUpdated, onUnmounted, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useSidebar } from './sidebar'

export function useAside() {
  const { hasSidebar } = useSidebar()
  const is960 = useMediaQuery('(min-width: 960px)')
  const is1280 = useMediaQuery('(min-width: 1280px)')
  const asideScrollY = ref<number>(0)

  const isAsideEnabled = computed(() => {
    if (!is1280.value && !is960.value) {
      return false
    }

    return hasSidebar.value ? is1280.value : is960.value
  })

  onMounted(listenScroll)
  onUpdated(listenScroll)
  onUnmounted(() => {
    document
      .querySelector('.aside-container')
      ?.removeEventListener('scroll', onScroll)
  })

  return {
    isAsideEnabled,
    asideScrollY
  }

  function listenScroll() {
    const container = document.querySelector('.aside-container')
    if (container == null) return
    asideScrollY.value = container.scrollTop
    container.removeEventListener('scroll', onScroll)
    container.addEventListener('scroll', onScroll)
  }

  function onScroll(e: any) {
    asideScrollY.value = e.target.scrollTop
  }
}
