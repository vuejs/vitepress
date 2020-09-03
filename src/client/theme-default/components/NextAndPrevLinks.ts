import { defineComponent, computed } from 'vue'
import { usePageData } from 'vitepress'

export default defineComponent({
  setup() {
    const pageData = usePageData()
    const next = computed(() => {
      return pageData.value.next
    })
    const prev = computed(() => {
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
