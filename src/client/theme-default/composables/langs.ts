import { computed } from 'vue'
import { useData } from 'vitepress'

export function useLangs() {
  const { site, localeIndex } = useData()
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
            link: value.link || (key === 'root' ? '/' : `/${key}/`)
          }
    )
  )

  return { localeLinks, currentLang }
}
