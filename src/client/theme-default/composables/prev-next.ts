import { computed } from 'vue'
import { useData } from './data.js'
import { isActive } from '../support/utils.js'
import { getSidebar, getFlatSideBarLinks } from '../support/sidebar.js'

export function usePrevNext() {
  const { page, theme, frontmatter } = useData()

  return computed(() => {
    const sidebar = getSidebar(theme.value.sidebar, page.value.relativePath)
    const candidates = getFlatSideBarLinks(sidebar)

    const index = candidates.findIndex((link) => {
      return isActive(page.value.relativePath, link.link)
    })

    return {
      prev: {
        ...candidates[index - 1],
        text: frontmatter.value.prev?.text ?? candidates[index - 1]?.text,
        link: frontmatter.value.prev?.link ?? candidates[index - 1]?.link
      },
      next: {
        ...candidates[index + 1],
        text: frontmatter.value.next?.text ?? candidates[index + 1]?.text,
        link: frontmatter.value.next?.link ?? candidates[index + 1]?.link
      }
    }
  })
}
