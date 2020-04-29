import { h } from 'vue'
import { useRoute } from '../router'

export const Content = {
  setup() {
    const route = useRoute()
    return () => (route.contentComponent ? h(route.contentComponent) : null)
  }
}
