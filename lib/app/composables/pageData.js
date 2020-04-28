import { toRef } from 'vue'
import { useRoute } from './router'

export function usePageData() {
  return toRef(useRoute(), 'pageData')
}
