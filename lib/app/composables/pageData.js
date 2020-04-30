import { inject } from 'vue'

/**
 * @typedef {import('vue').Ref<import('src').PageData>} PageDataRef
 */

/**
 * @type {import('vue').InjectionKey<PageDataRef>}
 */
export const pageDataSymbol = Symbol()

/**
 * @returns {PageDataRef}
 */
export function usePageData() {
  const data = inject(pageDataSymbol)
  if (!data) {
    throw new Error('usePageData() is called without provider.')
  }
  return data
}
