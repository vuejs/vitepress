import { computed } from 'vue'
import { useData } from 'vitepress'

export function useDocNav() {
  const { theme } = useData()

  return computed(() => {
    const { menu = 'Menu', returnToTop = 'Return to top' } =
      theme.value.docNav || {}

    return { menu, returnToTop }
  })
}
