import { defineComponent, h, ref, watchEffect } from 'vue'
import mermaid from 'mermaid'
import { useRoute } from '../router'

export const Mermaid = defineComponent({
  name: 'Mermaid',
  props: {
    src: String
  },
  setup({ src }) {
    const svg = ref<string | null>(null)
    const route = useRoute()

    watchEffect(() => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base' as mermaid.Mermaid['mermaidAPI']['Theme']['Base'],
        ...route.data.mermaidConfig
      })
      const id = Math.floor(Math.random() * 100000)

      if (src) {
        mermaid.render('mermaid-' + id, src, (svgCode) => {
          svg.value = svgCode
        })
      }
    })
    return () => h('div', { class: 'mermaid', innerHTML: svg.value }, [])
  }
})
