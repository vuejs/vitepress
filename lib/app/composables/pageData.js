import { ref, provide, inject } from 'vue'

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
const pageDataSymbol = Symbol()

export function initPageData() {
  const data = ref()
  provide(pageDataSymbol, data)
  return data
}

/**
 * @returns {PageDataRef}
 */
export function usePageData() {
  const data = inject(pageDataSymbol)
  if (__DEV__ && !data) {
    throw new Error(
      'usePageData() is called without initPageData() in an ancestor component.'
    )
  }
  // @ts-ignore
  return data
}
