import { computed } from 'vue'
import { ensureStartingSlash } from '../support/utils'
import { useData } from './data'

export function useLangs({ correspondingLink = false } = {}) {
  const { site, localeIndex, page, theme, hash } = useData()
  const currentLang = computed(() => {
    const lang = site.value.locales[localeIndex.value]
    return {
      label: lang?.label,
      link:
        lang?.link || localeIndex.value === 'root'
          ? '/'
          : `/${localeIndex.value}/`,
      repo: lang?.repo
        ? {
            link: typeof lang.repo === 'string' ? lang.repo : lang.repo.link,
            title:
              typeof lang.repo === 'string'
                ? `${lang.label} repository`
                : lang.repo.title
          }
        : undefined
    }
  })

  const localeLinks = computed(() =>
    Object.entries(site.value.locales).flatMap(([key, value]) =>
      currentLang.value.label === value.label
        ? []
        : {
            text: value.label,
            repo: value.repo
              ? {
                  link:
                    typeof value.repo === 'string'
                      ? value.repo
                      : value.repo.link,
                  title:
                    typeof value.repo === 'string'
                      ? `${value.label} repository`
                      : value.repo.title
                }
              : undefined,
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
