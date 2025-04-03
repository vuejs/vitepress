import { useData as useData$ } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'

export function useData() {
  const data = useData$<DefaultTheme.Config>()

  // Allow an arbitrary layout to be used as the home layout
  ;(data.frontmatter as any).isHomeLayout ??=
    (data.frontmatter as any).layout === 'home'

  return data
}
