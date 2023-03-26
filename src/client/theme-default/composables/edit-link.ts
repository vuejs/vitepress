import { computed } from 'vue'
import { useData } from './data'

export function useEditLink() {
  const { theme, page } = useData()

  return computed(() => {
    const { text = 'Edit this page', pattern = '' } = theme.value.editLink || {}
    const { relativePath, relativeFilePath } = page.value
    let url: string
    if (typeof pattern === 'function') {
      url = pattern({ relativePath, relativeFilePath })
    } else {
      url = pattern.replace(/:path/g, relativePath)
    }

    return { url, text }
  })
}
