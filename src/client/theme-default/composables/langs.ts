import { computed } from 'vue'
import { ensureStartingSlash } from '../support/utils'
import { useData } from './data'

export function useLangs({ correspondingLink = false } = {}) {
  const { site, localeIndex, page, theme, hash } = useData()
  const currentLang = computed(() => {
    const lang = site.value.locales[localeIndex.value]
    return {
      label: lang?.label,
      repository: lang?.repository,
      link:
        lang?.link || localeIndex.value === 'root'
          ? '/'
          : `/${localeIndex.value}/`
    }
  })

  const localeLinks = computed(() =>
    Object.entries(site.value.locales).flatMap(([key, value]) =>
      currentLang.value.label === value.label
        ? []
        : {
            text: value.label,
            repository: value.repository,
            link:
              normalizeLink(
                value.link || (key === 'root' ? '/' : `/${key}/`),
                theme.value.i18nRouting !== false && correspondingLink,
                page.value.relativePath.slice(
                  currentLang.value.link.length - 1
                ),
                !site.value.cleanUrls
              ) + hash.value
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
            .replace(/(^|\/)index\.md$/, '$1')
            .replace(/\.md$/, addExt ? '.html' : '')
        )
    : link
}
