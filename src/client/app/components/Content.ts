import { defineComponent, h, onUpdated } from 'vue'
import { useRoute } from '../router.js'

export const Content = defineComponent({
  name: 'VitePressContent',
  props: {
    onContentUpdated: Function
  },
  setup(props) {
    const route = useRoute()
    onUpdated(() => {
      props.onContentUpdated?.()
    })
    return () =>
      h('div', { style: { position: 'relative' } }, [
        route.component ? h(route.component) : null
      ])
  }
})
