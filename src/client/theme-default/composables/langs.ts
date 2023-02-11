import { computed } from 'vue'
import { useData } from './data.js'
import { ensureStartingSlash } from '../support/utils.js'

export function useLangs({
  removeCurrent = true,
  correspondingLink = false
} = {}) {
  const { site, localeIndex, page, theme } = useData()
  const currentLang = computed(() => ({
    label: site.value.locales[localeIndex.value]?.label,
    link:
      site.value.locales[localeIndex.value]?.link ||
      (localeIndex.value === 'root' ? '/' : `/${localeIndex.value}/`)
  }))

  const localeLinks = computed(() =>
    Object.entries(site.value.locales).flatMap(([key, value]) =>
      removeCurrent && currentLang.value.label === value.label
        ? []
        : {
            text: value.label,
            link: normalizeLink(
              value.link || (key === 'root' ? '/' : `/${key}/`),
              theme.value.i18nRouting !== false && correspondingLink,
              page.value.relativePath.slice(currentLang.value.link.length - 1),
              !site.value.cleanUrls
            )
          }
    )
  )

  return { localeLinks, currentLang }
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
            .replace(/(^|\/)?index.md$/, '$1')
            .replace(/\.md$/, addExt ? '.html' : '')
        )
    : link
}
