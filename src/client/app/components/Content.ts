import { defineComponent, h } from 'vue'
import { useData, useRoute } from 'vitepress'
import { contentUpdatedCallbacks } from '../utils'

const runCbs = () => contentUpdatedCallbacks.forEach((fn) => fn())

export const Content = defineComponent({
  name: 'VitePressContent',
  props: {
    as: { type: [Object, String], default: 'div' }
  },
  setup(props) {
    const route = useRoute()
    const { site } = useData()
    return () =>
      h(
        props.as,
        site.value.contentProps ?? { style: { position: 'relative' } },
        [
          route.component
            ? h(route.component, {
                onVnodeMounted: runCbs,
                onVnodeUpdated: runCbs
              })
            : '404 Page Not Found'
        ]
      )
  }
})
