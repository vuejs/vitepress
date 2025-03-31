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
  type PageData,
  type SiteData
} from '../shared'
import type { Route } from './router'
import { stackView } from './utils'

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
   * Current location hash
   */
  hash: Ref<string>
}

// site data is a singleton
export const siteDataRef: Ref<SiteData> = shallowRef(
  (import.meta.env.PROD ? siteData : readonly(siteData)) as SiteData
)

// hmr
if (import.meta.hot) {
  import.meta.hot.accept('@siteData', (m) => {
    if (m) {
      siteDataRef.value = m.default
    }
  })
}

function debugConfigLayers(path: string, layers: SiteData[]): SiteData[] {
  // This helps users to understand which configuration files are active
  if (inBrowser && import.meta.env.DEV) {
    const summaryTitle = `Config Layers for ${path}:`
    const summary = layers.map((c, i, arr) => {
      const n = i + 1
      if (n === arr.length) return `${n}. .vitepress/config (root)`
      return `${n}. ${(c as any)?.['[VP_SOURCE]'] ?? '(Unknown Source)'}`
    })
    console.debug(
      [summaryTitle, ''.padEnd(summaryTitle.length, '='), ...summary].join('\n')
    )
  }
  return layers
}

function getConfigLayers(root: SiteData, path: string): SiteData[] {
  if (!path.startsWith('/')) path = `/${path}`
  const additionalConfig = root.additionalConfig
  if (additionalConfig === undefined) return [root]
  else if (typeof additionalConfig === 'function')
    return [...(additionalConfig(path) as SiteData[]), root]
  const configs: SiteData[] = []
  const segments = path.split('/').slice(1, -1)
  while (segments.length) {
    const key = `/${segments.join('/')}/`
    if (key in additionalConfig) configs.push(additionalConfig[key] as SiteData)
    segments.pop()
  }
  if ('/' in additionalConfig) configs.push(additionalConfig['/'] as SiteData)
  return [...configs, root]
}

// per-app data
export function initData(route: Route): VitePressData {
  const site = computed(() => {
    const path = route.data.relativePath
    const data = resolveSiteDataByRoute(siteDataRef.value, path)
    return stackView(...debugConfigLayers(path, getConfigLayers(data, path)))
  })

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
