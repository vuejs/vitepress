import { computed } from 'vue'
import { useData } from 'vitepress'

export function useEditLink() {
  const { theme, page } = useData()

  return computed(() => {
    const url = [
      'https://github.com',
      theme.value.editLink?.repo || '???',
      'edit',
      theme.value.editLink?.branch || 'main',
      theme.value.editLink?.dir || null,
      page.value.relativePath
    ]
      .filter((v) => v)
      .join('/')

    const text = theme.value.editLink?.text ?? 'Edit this page'

    return {
      url,
      text
    }
  })
}
