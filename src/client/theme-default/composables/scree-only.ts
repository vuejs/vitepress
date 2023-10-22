import { useData } from './data'
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'

export function useScreenOnly(entry: keyof DefaultTheme.PrintOptions) {
  const { theme, frontmatter } = useData()

  return computed(
    () =>
      frontmatter.value[entry] === false ||
      theme.value.print === false ||
      (typeof theme.value.print === 'object' &&
        theme.value.print[entry] === false)
  )
}
