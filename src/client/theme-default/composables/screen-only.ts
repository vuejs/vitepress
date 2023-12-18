import { useData } from './data'
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'

export function useScreenOnly(entry: keyof DefaultTheme.PrintOptions) {
  const { theme, frontmatter } = useData()

  // we have aside and outline in frontmatter, we will check for both for outline
  return computed(
    () =>
      (entry === 'outline'
        ? frontmatter.value.aside === false ||
          frontmatter.value.outline === false
        : frontmatter.value[entry] === false) ||
      theme.value.print === false ||
      theme.value.print![entry] === false
  )
}
