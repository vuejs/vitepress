import { LocaleConfig, SiteData } from '../../types/shared'

export type {
  SiteData,
  PageData,
  HeadConfig,
  LocaleConfig,
  Header,
  DefaultTheme,
} from '../../types/shared'

export const EXTERNAL_URL_RE = /^https?:/i

export const inBrowser = typeof window !== 'undefined'

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
