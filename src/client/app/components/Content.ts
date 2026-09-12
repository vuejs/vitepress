import { useData, useRoute } from 'vitepress'
import { defineComponent, h, watch } from 'vue'

import { contentUpdatedCallbacks } from '../utils'
import { NotFound } from './NotFound'

const runCbs = () => contentUpdatedCallbacks.forEach((fn) => fn())

export const Content = defineComponent({
  name: 'VitePressContent',
  props: {
    as: { type: [Object, String], default: 'div' }
  },
  setup(props) {
    const { frontmatter, site } = useData()
    const route = useRoute()
    watch(frontmatter, runCbs, { deep: true, flush: 'post' })
    return () =>
      h(
        props.as,
        site.value.contentProps ?? {
          class: 'vp-content',
          style: { position: 'relative' }
        },
        [
          // a route without a component has nothing to show but a miss
          h(route.component ?? NotFound, {
            onVnodeMounted: runCbs,
            onVnodeUpdated: runCbs,
            onVnodeUnmounted: runCbs
          })
        ]
      )
  }
})
