import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'

import { useRoute } from '../../app/router'
import { isExternal, type Route, type VitePressData } from '../../shared'
import { useData } from './data'

export function useLangs({
  linkToCorrespondingPage = false
}: {
  /**
   * Link each entry of the translations menu to the current page's
   * equivalent in that locale (resolved by `resolveLocaleLink`) instead of
   * that locale's home page.
   */
  linkToCorrespondingPage?: boolean
} = {}) {
  const data = useData()
  const route = useRoute()
  const { site, localeIndex } = data

  const currentLang = computed(() => ({
    label: site.value.locales[localeIndex.value]?.label,
    link:
      site.value.locales[localeIndex.value]?.link ||
      (localeIndex.value === 'root' ? '/' : `/${localeIndex.value}/`)
  }))

  const localeLinks = computed(() =>
    Object.entries(site.value.locales).flatMap(([key, value]) =>
      currentLang.value.label === value.label
        ? []
        : {
            text: value.label,
            link: resolveLocaleLink(data, route, {
              targetLocale: key,
              targetLocaleLink:
                value.link || (key === 'root' ? '/' : `/${key}/`),
              linkToCorrespondingPage
            }),
            lang: value.lang,
            dir: value.dir
          }
    )
  )

  return { currentLang, localeLinks }
}

/**
 * Resolves the link used for switching from the current page to
 * `targetLocale` using the published translation, nearest landing page,
 * or locale home. A custom `i18nRouting` function controls the entire link.
 */
export function resolveLocaleLink(
  data: VitePressData<DefaultTheme.Config>,
  route: Route,
  {
    targetLocale,
    targetLocaleLink,
    linkToCorrespondingPage
  }: {
    /** Key of the target locale in `site.locales`, e.g. `'fr'` or `'root'`. */
    targetLocale: string
    /** Home link of the target locale, e.g. `'/fr/'`. */
    targetLocaleLink: string
    /** Link to the current page's equivalent instead of the locale home. */
    linkToCorrespondingPage: boolean
  }
) {
  const { site, theme } = data
  const i18nRouting = theme.value.i18nRouting

  if (!linkToCorrespondingPage || i18nRouting === false) {
    return targetLocaleLink + route.query + route.hash
  }
  if (typeof i18nRouting === 'function') {
    return i18nRouting(data, route, targetLocale)
  }
  if (isExternal(targetLocaleLink)) return targetLocaleLink

  const { localeLinks } = route.data
  const target =
    localeLinks && Object.hasOwn(localeLinks, targetLocale)
      ? localeLinks[targetLocale]
      : undefined
  if (!target) return targetLocaleLink

  const link = `/${target.path}`
    .replace(/\/index\.md$/, '/')
    .replace(/\.md$/, site.value.cleanUrls ? '' : '.html')
  return target.exact ? link + route.query + route.hash : link
}
