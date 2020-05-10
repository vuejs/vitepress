import serialized from '@siteData'
import { hot } from 'vite/hmr'
import { ref, readonly } from 'vue'

/**
 * @param {string} data
 * @returns {any}
 */
const parse = (data) => readonly(JSON.parse(data))

/**
 * @type {import('vue').Ref<import('src').SiteData>}
 */
export const siteDataRef = ref(parse(serialized))

export function useSiteData() {
  return siteDataRef
}

// hmr
if (__DEV__) {
  hot.accept('/@siteData', (m) => {
    siteDataRef.value = parse(m.default)
  })
}
