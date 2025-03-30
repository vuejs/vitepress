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
import { dirname, stackView } from './utils'

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

// hierarchical config pre-loading
const extraConfig: Record<string, SiteData> = Object.fromEntries(
  Object.entries(
    import.meta.glob('/**/config.([cm]?js|ts|json)', {
      eager: true
    })
  ).map(([path, module]) => [
    dirname(path),
    { __module__: path, ...((module as any)?.default ?? module) }
  ])
)

function getExtraConfigs(path: string): SiteData[] {
  if (!path.startsWith('/')) path = `/${path}`
  const configs: SiteData[] = []
  const segments = path.split('/').slice(1, -1)
  while (segments.length) {
    const key = `/${segments.join('/')}/`
    if (key in extraConfig) configs.push(extraConfig[key])
    segments.pop()
  }
  // debug info
  if (inBrowser) {
    const summaryTitle = `Config Layers for ${path}:`
    const summary = configs.map(
      (c, i) => `  ${i + 1}. ${(c as any).__module__}`
    )
    summary.push(`  ${summary.length + 1}. .vitepress/config (root)`)
    console.debug(
      [summaryTitle, ''.padEnd(summaryTitle.length, '='), ...summary].join('\n')
    )
  }
  return configs
}

// per-app data
export function initData(route: Route): VitePressData {
  const site = computed(() => {
    const data = resolveSiteDataByRoute(
      siteDataRef.value,
      route.data.relativePath
    )
    return stackView(...getExtraConfigs(route.data.relativePath), data)
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
