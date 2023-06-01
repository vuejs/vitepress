import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useSidebar } from './sidebar'

export function useAside() {
  const { hasSidebar } = useSidebar()
  const is960 = useMediaQuery('(min-width: 960px)')
  const is1280 = useMediaQuery('(min-width: 1280px)')
  const scrollY = ref<number>(0)

  const isAsideEnabled = computed(() => {
    if (!is1280.value && !is960.value) {
      return false
    }

    return hasSidebar.value ? is1280.value : is960.value
  })

  onMounted(() => {
    const container = document.querySelector('.aside-container')
    if (container == null) return
    scrollY.value = container.scrollTop
    container.addEventListener('scroll', onScroll)
  })

  onUnmounted(() => {
    document
      .querySelector('.aside-container')
      ?.removeEventListener('scroll', onScroll)
  })

  return {
    isAsideEnabled,
    scrollY
  }

  function onScroll(e: any) {
    scrollY.value = e.target.scrollTop
  }
}
