import { computed } from 'vue'
import { useData } from 'vitepress'
import type { DefaultTheme } from '../config'

export function useLanguageLinks() {
  const { site, localePath, theme } = useData()

  return computed(() => {
    const langs = site.value.langs
    const localePaths = Object.keys(langs)

    if (localePaths.length < 2) {
      return null
    }

    const routerPath = localePath.value

    const candidates = localePaths.map((v) => {
      const localePath = v.endsWith('/') ? v.slice(0, -1) : v

      return {
        text: langs[v],
        link: `${localePath}${routerPath}`
      }
    })

    const selectText = theme.value.selectText || 'Languages'

    return {
      text: selectText,
      items: candidates
    } as DefaultTheme.NavItemWithChildren
  })
}
