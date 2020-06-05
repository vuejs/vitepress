import { h } from 'vue'
import { useRoute } from '../router'
import { usePrefetch } from '../composables/preFetch'

export const Content = {
  setup() {
    const route = useRoute()
    if (process.env.NODE_ENV === 'production') {
      // in prod mode, enable intersectionObserver based pre-fetch.
      usePrefetch()
    }
    return () => (route.contentComponent ? h(route.contentComponent) : null)
  }
}
