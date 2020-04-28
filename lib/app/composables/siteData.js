import serialized from '@siteData'
import { hot } from '@hmr'
import { shallowRef, readonly } from 'vue'

/**
 * @param {string} data
 */
const parse = (data) =>
  __DEV__ ? readonly(JSON.parse(data)) : JSON.parse(data)

// site data
export const siteDataRef = shallowRef(parse(serialized))

export function useSiteData() {
  return siteDataRef
}

// hmr
hot.accept('/@siteData', (m) => {
  siteDataRef.value = parse(m.default)
})
