import { h } from 'vue'
import { useRoute } from '../router'
import { usePrefetch } from '../composables/preFetch'

export const Content = {
  setup() {
    const route = useRoute()
    if (!__DEV__) {
      // in prod mode, enable intersectionObserver based pre-fetch.
      usePrefetch()
    }
    return () => (route.contentComponent ? h(route.contentComponent) : null)
  }
}
