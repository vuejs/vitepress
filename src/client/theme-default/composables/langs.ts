import { computed } from 'vue'
import type { DefaultTheme } from 'vitepress/theme'
import type { VitePressData } from '../../app/data'
import { useRoute, type Route } from '../../app/router'
import { ensureStartingSlash } from '../support/utils'
import { useData } from './data'

export function useLangs({ correspondingLink = false } = {}) {
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
            link: resolveLocaleLink(
              data,
              route,
              key,
              value.link || (key === 'root' ? '/' : `/${key}/`),
              currentLang.value.link,
              correspondingLink
            ),
            lang: value.lang,
            dir: value.dir
          }
    )
  )

  return { localeLinks, currentLang }
}

export function resolveLocaleLink(
  data: VitePressData<DefaultTheme.Config>,
  route: Route,
  targetLocale: string,
  targetLink: string,
  currentLink: string,
  correspondingLink: boolean
) {
  const { site, page, theme } = data
  const i18nRouting = theme.value.i18nRouting

  if (correspondingLink && typeof i18nRouting === 'function') {
    return i18nRouting(data, route.hash, targetLocale)
  }

  return (
    normalizeLink(
      targetLink,
      i18nRouting !== false && correspondingLink,
      page.value.relativePath.slice(currentLink.length - 1),
      !site.value.cleanUrls
    ) +
    route.query +
    route.hash
  )
}

function normalizeLink(
  link: string,
  addPath: boolean,
  path: string,
  addExt: boolean
) {
  return addPath
    ? link.replace(/\/$/, '') +
        ensureStartingSlash(
          path
            .replace(/(^|\/)index\.md$/, '$1')
            .replace(/\.md$/, addExt ? '.html' : '')
        )
    : link
}
