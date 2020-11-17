import { computed } from 'vue'
import { useRoute } from '../router'

export function usePageData() {
  const route = useRoute()

  return computed(() => route.data)
}
