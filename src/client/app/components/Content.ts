import { defineComponent, h } from 'vue'
import { useRoute } from '../router'
import { contentUpdatedCallbacks } from '../utils'

const runCbs = () => contentUpdatedCallbacks.forEach((fn) => fn())

export const Content = defineComponent({
  name: 'VitePressContent',
  props: {
    as: { type: [Object, String], default: 'div' }
  },
  setup(props) {
    const route = useRoute()
    return () =>
      h(props.as, { style: { position: 'relative' } }, [
        route.component
          ? h(route.component, {
              onVnodeMounted: runCbs,
              onVnodeUpdated: runCbs
            })
          : '404 Page Not Found'
      ])
  }
})
