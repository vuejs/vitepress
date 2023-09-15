import siteData from '@siteData'
import { useDark } from '@vueuse/core'
import {
  computed,
  inject,
  readonly,
  ref,
  shallowRef,
  type InjectionKey,
  type Ref
} from 'vue'
import {
  APPEARANCE_KEY,
  createTitle,
  resolveSiteDataByRoute,
  type PageData,
  type SiteData
} from '../shared'
import type { Route } from './router'

export const dataSymbol: InjectionKey<VitePressData> = Symbol()

export interface VitePressData<T = any> {
  /**
   * Site-level metadata
   */
  site: Ref<SiteData<T>>
  /**
   * themeConfig from .vitepress/config.js
   */
  theme: Ref<T>
  /**
   * Page-level metadata
   */
  page: Ref<PageData>
  /**
   * page frontmatter data
   */
  frontmatter: Ref<PageData['frontmatter']>
  /**
   * dynamic route params
   */
  params: Ref<PageData['params']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  isDark: Ref<boolean>
  dir: Ref<string>
  localeIndex: Ref<string>
}

// site data is a singleton
export const siteDataRef: Ref<SiteData> = shallowRef(
  (import.meta.env.PROD ? siteData : readonly(siteData)) as SiteData
)

// hmr
if (import.meta.hot) {
  import.meta.hot.accept('/@siteData', (m) => {
    if (m) {
      siteDataRef.value = m.default
    }
  })
}

// per-app data
export function initData(route: Route): VitePressData {
  const site = computed(() =>
    resolveSiteDataByRoute(siteDataRef.value, route.data.relativePath)
  )

  const appearance = site.value.appearance // fine with reactivity being lost here, config change triggers a restart
  const isDark =
    appearance === 'force-dark'
      ? ref(true)
      : appearance
      ? useDark({
          storageKey: APPEARANCE_KEY,
          initialValue: () =>
            typeof appearance === 'string' ? appearance : 'auto',
          ...(typeof appearance === 'object' ? appearance : {})
        })
      : ref(false)

  return {
    site,
    theme: computed(() => site.value.themeConfig),
    page: computed(() => route.data),
    frontmatter: computed(() => route.data.frontmatter),
    params: computed(() => route.data.params),
    lang: computed(() => site.value.lang),
    dir: computed(() => site.value.dir),
    localeIndex: computed(() => site.value.localeIndex || 'root'),
    title: computed(() => {
      return createTitle(site.value, route.data)
    }),
    description: computed(() => {
      return route.data.description || site.value.description
    }),
    isDark
  }
}

export function useData<T = any>(): VitePressData<T> {
  const data = inject(dataSymbol)
  if (!data) {
    throw new Error('vitepress data not properly injected in app')
  }
  return data
}
