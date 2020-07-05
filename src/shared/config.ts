import { SiteData } from '../../types/shared'

function findMatchRoot(route: string, roots: string[]) {
  roots.sort((a, b) => b.length - a.length)
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
      ...localeThemeConfig
    }
  }
}
