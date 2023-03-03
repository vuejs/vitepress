import { defineComponent, h } from 'vue'
import { useRoute } from '../router.js'

export const Content = defineComponent({
  name: 'VitePressContent',
  props: {
    as: { type: [Object, String], default: 'div' }
  },
  setup(props) {
    const route = useRoute()
    return () =>
      h(props.as, { style: { position: 'relative' } }, [
        route.component ? h(route.component) : null
      ])
  }
})
