import { computed } from 'vue'
import { useData } from 'vitepress'
import { isExternal } from '../support/utils.js'

export function useLangs() {
  const { site, localeIndex } = useData()
  const currentLang = computed(() => ({
    label: site.value.locales[localeIndex.value]?.label,
    link:
      localeIndex.value === 'root'
        ? '/'
        : site.value.locales[localeIndex.value].link || `/${localeIndex.value}/`
  }))

  const localeLinks = computed(() =>
    Object.entries(site.value.locales).flatMap(([key, value]) =>
      currentLang.value.label === value.label
        ? []
        : {
            text: value.label,
            link:
              key === 'root'
                ? '/'
                : isExternal(key)
                ? key
                : value.link || `/${key}/`
          }
    )
  )

  return { localeLinks, currentLang }
}
