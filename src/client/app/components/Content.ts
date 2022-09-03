import { defineComponent, h } from 'vue'
import { useRoute } from '../router.js'

export const Content = defineComponent({
  name: 'VitePressContent',
  setup() {
    const route = useRoute()
    return () =>
      h('div', { style: { position: 'relative' } }, [
        route.component ? h(route.component) : null
      ])
  }
})
