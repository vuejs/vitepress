import { Ref, computed } from 'vue'
import { PageData } from '/@types/shared'
import { Route, useRoute } from '../router'

export type PageDataRef = Ref<PageData>

export function usePageData(route?: Route) {
  const r = route || useRoute()

  return computed(() => r.data)
}
