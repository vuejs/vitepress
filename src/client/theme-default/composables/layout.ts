import { computed } from 'vue'
import { useData } from './data'

export function useLayout() {
  const { frontmatter } = useData()

  const isHome = computed(() => {
    if (frontmatter.value.isHome !== undefined)
      return Boolean(frontmatter.value.isHome)
    else return frontmatter.value.layout === 'home'
  })

  return { isHome }
}
