import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import { useRoute } from '../../app/router'
import type { Route, VitePressData } from '../../shared'
import { ensureStartingSlash } from '../support/utils'
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
              currentLocaleLink: currentLang.value.link,
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
 * `targetLocale`. Without `linkToCorrespondingPage`, this is simply the home
 * of the target locale. With it, the current page's path is rewritten into
 * the target locale (honoring `cleanUrls`) — unless
 * `themeConfig.i18nRouting` is `false` (the locale home is used instead) or
 * a function (which then fully controls the resolution).
 *
 * The current query and hash are carried over, except when a custom
 * `i18nRouting` function is used.
 */
export function resolveLocaleLink(
  data: VitePressData<DefaultTheme.Config>,
  route: Route,
  {
    targetLocale,
    targetLocaleLink,
    currentLocaleLink,
    linkToCorrespondingPage
  }: {
    /** Key of the target locale in `site.locales`, e.g. `'fr'` or `'root'`. */
    targetLocale: string
    /** Home link of the target locale, e.g. `'/fr/'`. */
    targetLocaleLink: string
    /** Home link of the locale the current page is in, e.g. `'/'`. */
    currentLocaleLink: string
    /** Link to the current page's equivalent instead of the locale home. */
    linkToCorrespondingPage: boolean
  }
) {
  const { site, theme } = data
  const i18nRouting = theme.value.i18nRouting

  if (linkToCorrespondingPage && typeof i18nRouting === 'function') {
    return i18nRouting(data, route, targetLocale)
  }

  return (
    normalizeLink(
      targetLocaleLink,
      i18nRouting !== false && linkToCorrespondingPage,
      route.data.relativePath.slice(currentLocaleLink.length - 1),
      !site.value.cleanUrls
    ) +
    route.query +
    route.hash
  )
}

function normalizeLink(
  localeLink: string,
  appendPagePath: boolean,
  pagePath: string,
  addHtmlExt: boolean
) {
  return appendPagePath
    ? localeLink.replace(/\/$/, '') +
        ensureStartingSlash(
          pagePath
            .replace(/(^|\/)index\.md$/, '$1')
            .replace(/\.md$/, addHtmlExt ? '.html' : '')
        )
    : localeLink
}
