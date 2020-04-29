import serialized from '@siteData'
import { hot } from '@hmr'
import { shallowRef, readonly } from 'vue'

/**
 * @param {string} data
 */
const parse = (data) =>
  __DEV__ ? readonly(JSON.parse(data)) : JSON.parse(data)

// site data
const siteDataRef = shallowRef(parse(serialized))

export function useSiteData() {
  return siteDataRef
}

// hmr
if (__DEV__) {
  hot.accept('/@siteData', (m) => {
    siteDataRef.value = parse(m.default)
  })
}
