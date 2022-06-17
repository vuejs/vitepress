import { InjectionKey, Ref, shallowRef, readonly, computed, inject } from 'vue'
import { Route } from './router'
import siteData from '@siteData'
import {
  PageData,
  SiteData,
  resolveSiteDataByRoute,
  createTitle
} from '../shared'
import { withBase } from './utils'

export const dataSymbol: InjectionKey<VitePressData> = Symbol()

export interface VitePressData<T = any> {
  site: Ref<SiteData<T>>
  page: Ref<PageData>
  theme: Ref<T>
  frontmatter: Ref<PageData['frontmatter']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  localePath: Ref<string>
}

// site data is a singleton
export type SiteDataRef<T = any> = Ref<SiteData<T>>

export const siteDataRef: Ref<SiteData> = shallowRef(
  import.meta.env.PROD ? siteData : readonly(siteData)
)

// hmr
if (import.meta.hot) {
  import.meta.hot!.accept('/@siteData', (m) => {
    siteDataRef.value = m.default
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
      const { langs, lang } = site.value
      const path = Object.keys(langs).find(
        (langPath) => langs[langPath].lang === lang
      )
      return withBase(path || '/')
    }),
    title: computed(() => {
      return createTitle(site.value, route.data)
    }),
    description: computed(() => {
      return route.data.description || site.value.description
    })
  }
}

export function useData<T = any>(): VitePressData<T> {
  const data = inject(dataSymbol)
  if (!data) {
    throw new Error('vitepress data not properly injected in app')
  }
  return data
}
