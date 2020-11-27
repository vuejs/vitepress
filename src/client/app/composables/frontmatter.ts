import { Ref, computed } from 'vue'
import { usePageData } from './pageData'

export type FrontmatterRef = Ref<Record<string, any>>

export function useFrontmatter() {
  return computed(() => usePageData().value.frontmatter)
}
