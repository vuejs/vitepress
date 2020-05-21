import serialized from '@siteData'
import { ref, readonly, Ref } from 'vue'
import { SiteData } from '../../../../types/shared'
import { hot } from 'vite/hmr'

const parse = (data: string) => readonly(JSON.parse(data) as SiteData)

export const siteDataRef: Ref<SiteData> = ref(parse(serialized))

export function useSiteData() {
  return siteDataRef
}

// hmr
if (__DEV__) {
  hot.accept('/@siteData', (m) => {
    siteDataRef.value = parse(m.default)
  })
}
