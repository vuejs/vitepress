import { onContentUpdated } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { computed, shallowRef } from 'vue'
import { getHeaders, type MenuItem } from '../composables/outline'
import { useData } from './data'

export function useLocalNav(): DefaultTheme.DocLocalNav {
  const { theme, frontmatter } = useData()

  const headers = shallowRef<MenuItem[]>([])

  const hasLocalNav = computed(() => {
    return headers.value.length > 0
  })

  onContentUpdated(() => {
    headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline)
  })

  return {
    headers,
    hasLocalNav
  }
}
