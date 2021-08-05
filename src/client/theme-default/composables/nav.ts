import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import type { DefaultTheme } from '../config'

export function useLanguageLinks() {
  const { site, localePath, theme } = useData()

  return computed(() => {
    const langs = site.value.langs
    const localePaths = Object.keys(langs)

    if (localePaths.length < 2) {
      return null
    }

    const route = useRoute()

    // intentionally remove the leading slash because each locale has one
    const currentPath = route.path.replace(localePath.value, '')

    const candidates = localePaths.map((v) => ({
      text: langs[v].label,
      link: `${v}${currentPath}`
    }))

    const selectText = theme.value.selectText || 'Languages'

    return {
      text: selectText,
      items: candidates
    } as DefaultTheme.NavItemWithChildren
  })
}
