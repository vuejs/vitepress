import { inject, InjectionKey, Ref } from 'vue'
import { PageData } from '../../../../types/shared'

export type PageDataRef = Ref<PageData>

export const pageDataSymbol: InjectionKey<PageDataRef> = Symbol()

export function usePageData(): PageDataRef {
  const data = inject(pageDataSymbol)
  if (!data) {
    throw new Error('usePageData() is called without provider.')
  }
  return data
}
