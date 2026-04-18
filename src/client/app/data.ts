import siteData from '@siteData'
import { usePreferredDark } from '@vueuse/core'
import {
  computed,
  inject,
  readonly,
  ref,
  shallowRef,
  watch,
  watchEffect,
  type InjectionKey,
  type Ref,
  type WritableComputedRef
} from 'vue'
import {
  APPEARANCE_KEY,
  createTitle,
  inBrowser,
  resolveSiteDataByRoute,
  type PageData,
  type SiteData
} from '../shared'
import type { Route } from './router'

export type AppearanceMode = 'auto' | 'light' | 'dark'

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
  dir: Ref<string>
  localeIndex: Ref<string>
  isDark: Ref<boolean>
  /**
   * The current appearance mode: 'auto' (follow system), 'light', or 'dark'
   */
  appearanceMode: Ref<AppearanceMode>
  /**
   * Current location hash
   */
  hash: Ref<string>
}

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
  const prefersDark = appearance ? usePreferredDark() : ref(false)

  let isDark: Ref<boolean>
  let appearanceMode: Ref<AppearanceMode>

  if (appearance === 'force-dark') {
    isDark = ref(true)
    appearanceMode = ref('dark')
  } else if (appearance === 'force-auto') {
    isDark = prefersDark
    appearanceMode = ref('auto')
  } else if (appearance) {
    const defaultMode: AppearanceMode = appearance === 'dark' ? 'dark' : 'auto'

    appearanceMode = ref<AppearanceMode>(
      inBrowser
        ? (localStorage.getItem(APPEARANCE_KEY) as AppearanceMode) ||
            defaultMode
        : defaultMode
    )

    isDark = computed({
      get: () => {
        if (appearanceMode.value === 'auto') return prefersDark.value
        return appearanceMode.value === 'dark'
      },
      set: (v: boolean) => {
        appearanceMode.value = v ? 'dark' : 'light'
      }
    }) as WritableComputedRef<boolean>

    if (inBrowser) {
      watchEffect(() => {
        document.documentElement.classList.toggle('dark', isDark.value)
      })
      watch(appearanceMode, (val) => {
        localStorage.setItem(APPEARANCE_KEY, val)
      })
    }
  } else {
    isDark = ref(false)
    appearanceMode = ref('light')
  }

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
    appearanceMode,
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
