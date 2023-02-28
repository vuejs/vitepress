import { defineComponent, h, onUpdated } from 'vue'
import { useRoute } from '../router.js'

export const Content = defineComponent({
  name: 'VitePressContent',
  props: {
    onContentUpdated: Function,
    as: { type: [Object, String], default: 'div' }
  },
  setup(props) {
    const route = useRoute()
    onUpdated(() => {
      props.onContentUpdated?.()
    })
    return () =>
      h(props.as, { style: { position: 'relative' } }, [
        route.component ? h(route.component) : null
      ])
  }
})
