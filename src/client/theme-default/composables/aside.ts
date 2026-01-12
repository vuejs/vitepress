import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'
import { useLayout } from './layout'

export function useAside() {
  const { hasSidebar } = useLayout()
  const is960 = useMediaQuery('(min-width: 960px)')
  const is1200 = useMediaQuery('(min-width: 1200px)')

  const isAsideEnabled = computed(() => {
    if (!is1200.value && !is960.value) {
      return false
    }

    return hasSidebar.value ? is1200.value : is960.value
  })

  return {
    isAsideEnabled
  }
}
