import serialized from '@siteData'
import { ref, readonly, Ref } from 'vue'
import { SiteData } from '../../../../types/shared'

const parse = (data: string) => readonly(JSON.parse(data)) as SiteData

export type SiteDataRef<T = any> = Ref<SiteData<T>>

export const siteDataRef: Ref<SiteData> = ref(parse(serialized))

export function useSiteData<T = any>() {
  return siteDataRef as Ref<SiteData<T>>
}

// hmr
if (import.meta.hot) {
  import.meta.hot!.acceptDeps('/@siteData', (m) => {
    siteDataRef.value = parse(m.default)
  })
}
