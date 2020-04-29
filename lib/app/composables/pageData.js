import { inject } from 'vue'

/**
 * @typedef {{
 *   a: 1
 * }} PageData
 *
 * @typedef {import('vue').Ref<PageData>} PageDataRef
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
