import serialized from '@siteData'
import { SiteData } from '/@types/shared'
import { Ref, ref, readonly } from 'vue'

export type SiteDataRef<T = any> = Ref<SiteData<T>>

export const siteDataRef: Ref<SiteData> = ref(parse(serialized))

export function useSiteData<T = any>() {
  return siteDataRef as Ref<SiteData<T>>
}

function parse(data: string): SiteData {
  return readonly(JSON.parse(data)) as SiteData
}

// hmr
if (import.meta.hot) {
  import.meta.hot!.acceptDeps('/@siteData', (m) => {
    siteDataRef.value = parse(m.default)
  })
}
