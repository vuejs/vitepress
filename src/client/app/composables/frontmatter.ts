import { Ref, computed } from 'vue'
import { usePageData } from './pageData'

export type FrontmatterRef = Ref<Record<string, any>>

export function useFrontmatter() {
  const pageData = usePageData()
  return computed(() => pageData.value.frontmatter)
}
