import { computed } from 'vue'
import { useData } from './data'

export function useDerived() {
  const { frontmatter } = useData()

  const isHomeLayout = computed(() => {
    if (frontmatter.value.isHomeLayout !== undefined)
      return Boolean(frontmatter.value.isHomeLayout)
    else return frontmatter.value.layout === 'home'
  })

  return { isHomeLayout }
}
