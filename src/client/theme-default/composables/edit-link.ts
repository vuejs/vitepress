import { computed } from 'vue'
import { useData } from './data'

export function useEditLink() {
  const { theme, page } = useData()

  return computed(() => {
    const { text = 'Edit this page', pattern = '' } = theme.value.editLink || {}
    const { filePath } = page.value
    let url: string
    if (typeof pattern === 'function') {
      url = pattern({ filePath })
    } else {
      url = pattern.replace(/:path/g, filePath)
    }

    return { url, text }
  })
}
