import { InjectionKey, Ref, ref, readonly, computed, inject } from 'vue'
import { Route } from './router'
import { PageData, SiteData } from '/@types/shared'
import serializedSiteData from '@siteData'
import { resolveSiteDataByRoute } from '../shared/config'

export const dataSymbol: InjectionKey<VitePressData> = Symbol()

export interface VitePressData {
  site: Ref<SiteData>
  theme: Ref<any>
  page: Ref<PageData>
  frontmatter: Ref<any>
  lang: Ref<string>
  localePath: Ref<string>
  title: Ref<string>
  description: Ref<string>
}

// site data is a singleton
export type SiteDataRef<T = any> = Ref<SiteData<T>>

export const siteDataRef: Ref<SiteData> = ref(parse(serializedSiteData))

function parse(data: string): SiteData {
  return readonly(JSON.parse(data)) as SiteData
}

// hmr
if (import.meta.hot) {
  import.meta.hot!.accept('/@siteData', (m) => {
    siteDataRef.value = parse(m.default)
  })
}

// per-app data
export function initData(route: Route): VitePressData {
  const site = computed(() =>
    resolveSiteDataByRoute(siteDataRef.value, route.path)
  )

  return {
    site,
    theme: computed(() => site.value.themeConfig),
    page: computed(() => route.data),
    frontmatter: computed(() => route.data.frontmatter),
    lang: computed(() => site.value.lang),
    localePath: computed(() => {
      const { locales, lang } = site.value
      const path = Object.keys(locales).find((lp) => locales[lp].lang === lang)
      return (locales && path) || '/'
    }),
    title: computed(() => {
      return route.data.title
        ? route.data.title + ' | ' + site.value.title
        : site.value.title
    }),
    description: computed(() => {
      return route.data.description || site.value.description
    })
  }
}

export function useData(): VitePressData {
  const data = inject(dataSymbol)
  if (!data) {
    throw new Error('vitepress data not properly injected in app')
  }
  return data
}
