import { defineComponent, computed } from 'vue'
import { usePageData } from 'vitepress'

export default defineComponent({
  setup() {
    const pageData = usePageData()
    const next = computed(() => {
      if (pageData.value.frontmatter.next === false) {
        return undefined
      }
      return pageData.value.next
    })
    const prev = computed(() => {
      if (pageData.value.frontmatter.prev === false) {
        return undefined
      }
      return pageData.value.prev
    })
    const hasLinks = computed(() => {
      return !!next || !!prev
    })
    return {
      next,
      prev,
      hasLinks
    }
  }
})
