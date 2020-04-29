import serialized from '@siteData'
import { hot } from '@hmr'
import { ref, readonly } from 'vue'

/**
 * @param {string} data
 */
const parse = (data) => readonly(JSON.parse(data))

// site data
const siteDataRef = ref(parse(serialized))

export function useSiteData() {
  return siteDataRef
}

// hmr
if (__DEV__) {
  hot.accept('/@siteData', (m) => {
    siteDataRef.value = parse(m.default)
  })
}
