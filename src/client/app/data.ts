import siteData from '@siteData'
import { useDark, usePreferredDark } from '@vueuse/core'
import {
  computed,
  inject,
  readonly,
  ref,
  shallowRef,
  watch,
  type InjectionKey,
  type Ref
} from 'vue'
import {
  APPEARANCE_KEY,
  createTitle,
  inBrowser,
  resolveSiteDataByRoute,
  type SiteData,
  type VitePressData
} from '../shared'
import type { Route } from './router'

export const dataSymbol: InjectionKey<VitePressData> = Symbol()
export type { VitePressData } from '../shared'

// site data is a singleton
export const siteDataRef: Ref<SiteData> = shallowRef(
  readonly(siteData) as SiteData
)

// per-app data
export function initData(route: Route): VitePressData {
  const site = computed(() =>
    resolveSiteDataByRoute(siteDataRef.value, route.data.relativePath)
  )

  const appearance = site.value.appearance // fine with reactivity being lost here, config change triggers a restart
  const isDark =
    appearance === 'force-dark'
      ? ref(true)
      : appearance === 'force-auto'
        ? usePreferredDark()
        : appearance
          ? useDark({
              storageKey: APPEARANCE_KEY,
              initialValue: () => (appearance === 'dark' ? 'dark' : 'auto'),
              ...(typeof appearance === 'object' ? appearance : {})
            })
          : ref(false)

  const hashRef = ref(inBrowser ? location.hash : '')

  if (inBrowser) {
    window.addEventListener('hashchange', () => {
      hashRef.value = location.hash
    })
  }

  watch(
    () => route.data,
    () => {
      hashRef.value = inBrowser ? location.hash : ''
    }
  )

  return {
    site,
    theme: computed(() => site.value.themeConfig),
    page: computed(() => route.data),
    frontmatter: computed(() => route.data.frontmatter),
    params: computed(() => route.data.params),
    lang: computed(() => site.value.lang),
    dir: computed(() => route.data.frontmatter.dir || site.value.dir),
    localeIndex: computed(() => site.value.localeIndex || 'root'),
    title: computed(() => createTitle(site.value, route.data)),
    description: computed(
      () => route.data.description || site.value.description
    ),
    isDark,
    hash: computed(() => hashRef.value)
  }
}

export function useData<T = any>(): VitePressData<T> {
  const data = inject(dataSymbol)
  if (!data) {
    throw new Error('vitepress data not properly injected in app')
  }
  return data
}
