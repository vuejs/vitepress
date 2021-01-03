import { defineComponent, h } from 'vue'
import { useRoute } from '../router'

export const Content = defineComponent({
  name: 'VitePressContent',
  setup() {
    const route = useRoute()
    return () => (route.component ? h(route.component) : null)
  }
})
