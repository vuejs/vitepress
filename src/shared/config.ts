import { SiteData } from '../../types/shared'

function findMatchRoot(route: string, roots: string[]) {
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
  return undefined
}

function resolveLocales<T>(
  locales: Record<string, T>,
  route: string
): T | undefined {
  const localeRoot = findMatchRoot(route, Object.keys(locales))
  return localeRoot ? locales[localeRoot] : undefined
}

// this merges the locales data to the main data by the route
export function resolveSiteDataByRoute(siteData: SiteData, route: string) {
  const localeData = resolveLocales(siteData.locales || {}, route) || {}
  const localeThemeConfig =
    resolveLocales<any>(
      (siteData.themeConfig && siteData.themeConfig.locales) || {},
      route
    ) || {}

  return {
    ...siteData,
    ...localeData,
    themeConfig: {
      ...siteData.themeConfig,
      ...localeThemeConfig,
      // clean the locales to reduce the bundle size
      locales: {}
    },
    locales: {}
  }
}
