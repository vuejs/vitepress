import {
  SiteData,
  PageData,
  LocaleConfig,
  HeadConfig
} from '../../types/shared.js'

export type {
  SiteData,
  PageData,
  HeadConfig,
  LocaleConfig,
  Header,
  DefaultTheme,
  PageDataPayload,
  CleanUrlsMode
} from '../../types/shared.js'

export const EXTERNAL_URL_RE = /^[a-z]+:/i
export const APPEARANCE_KEY = 'vitepress-theme-appearance'

export const inBrowser = typeof window !== 'undefined'

export const notFoundPageData: PageData = {
  relativePath: '',
  title: '404',
  description: 'Not Found',
  headers: [],
  frontmatter: { sidebar: false, layout: 'page' },
  lastUpdated: 0
}

function findMatchRoot(route: string, roots: string[]): string | undefined {
  // first match to the routes with the most deep level.
  roots.sort((a, b) => {
    const levelDelta = b.split('/').length - a.split('/').length
    if (levelDelta !== 0) {
      return levelDelta
    } else {
      return b.length - a.length
    }
  })

  for (const r of roots) {
    if (route.startsWith(r)) return r
  }
}

function resolveLocales<T>(
  locales: Record<string, T>,
  route: string
): T | undefined {
  const localeRoot = findMatchRoot(route, Object.keys(locales))
  return localeRoot ? locales[localeRoot] : undefined
}

export function createLangDictionary(siteData: {
  themeConfig?: Record<string, any>
  locales?: Record<string, LocaleConfig>
}) {
  const { locales } = siteData.themeConfig || {}
  const siteLocales = siteData.locales
  return locales && siteLocales
    ? Object.keys(locales).reduce((langs, path) => {
        langs[path] = {
          label: locales![path].label,
          lang: siteLocales[path].lang
        }
        return langs
      }, {} as Record<string, { lang: string; label: string }>)
    : {}
}

// this merges the locales data to the main data by the route
export function resolveSiteDataByRoute(
  siteData: SiteData,
  route: string
): SiteData {
  route = cleanRoute(siteData, route)

  const localeData = resolveLocales(siteData.locales || {}, route)
  const localeThemeConfig = resolveLocales<any>(
    siteData.themeConfig.locales || {},
    route
  )

  // avoid object rest spread since this is going to run in the browser
  // and spread is going to result in polyfill code
  return Object.assign({}, siteData, localeData, {
    themeConfig: Object.assign({}, siteData.themeConfig, localeThemeConfig, {
      // clean the locales to reduce the bundle size
      locales: {}
    }),
    lang: (localeData || siteData).lang,
    // clean the locales to reduce the bundle size
    locales: {},
    langs: createLangDictionary(siteData)
  })
}

/**
 * Create the page title string based on configs.
 */
export function createTitle(siteData: SiteData, pageData: PageData): string {
  const title = pageData.title || siteData.title
  const template = pageData.titleTemplate ?? siteData.titleTemplate

  if (typeof template === 'string' && template.includes(':title')) {
    return template.replace(/:title/g, title)
  }

  const templateString = createTitleTemplate(siteData.title, template)

  return `${title}${templateString}`
}

function createTitleTemplate(
  siteTitle: string,
  template?: string | boolean
): string {
  if (template === false) {
    return ''
  }

  if (template === true || template === undefined) {
    return ` | ${siteTitle}`
  }

  if (siteTitle === template) {
    return ''
  }

  return ` | ${template}`
}

/**
 * Clean up the route by removing the `base` path if it's set in config.
 */
function cleanRoute(siteData: SiteData, route: string): string {
  if (!inBrowser) {
    return route
  }

  const base = siteData.base
  const baseWithoutSuffix = base.endsWith('/') ? base.slice(0, -1) : base

  return route.slice(baseWithoutSuffix.length)
}

function hasTag(head: HeadConfig[], tag: HeadConfig) {
  const [tagType, tagAttrs] = tag
  if (tagType !== 'meta') return false
  const keyAttr = Object.entries(tagAttrs)[0] // First key
  if (keyAttr == null) return false
  return head.some(
    ([type, attrs]) => type === tagType && attrs[keyAttr[0]] === keyAttr[1]
  )
}

export function mergeHead(prev: HeadConfig[], curr: HeadConfig[]) {
  return [...prev.filter((tagAttrs) => !hasTag(curr, tagAttrs)), ...curr]
}
