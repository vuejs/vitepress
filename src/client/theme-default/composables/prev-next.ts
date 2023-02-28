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
      prev:
        frontmatter.value.prev === false
          ? undefined
          : {
              text:
                (typeof frontmatter.value.prev === 'string'
                  ? frontmatter.value.prev
                  : typeof frontmatter.value.prev === 'object'
                  ? frontmatter.value.prev.text
                  : undefined) ?? candidates[index - 1]?.text,
              link:
                (typeof frontmatter.value.prev === 'object'
                  ? frontmatter.value.prev.link
                  : undefined) ?? candidates[index - 1]?.link
            },
      next:
        frontmatter.value.next === false
          ? undefined
          : {
              text:
                (typeof frontmatter.value.next === 'string'
                  ? frontmatter.value.next
                  : typeof frontmatter.value.next === 'object'
                  ? frontmatter.value.next.text
                  : undefined) ?? candidates[index + 1]?.text,
              link:
                (typeof frontmatter.value.next === 'object'
                  ? frontmatter.value.next.link
                  : undefined) ?? candidates[index + 1]?.link
            }
    } as {
      prev?: { text?: string; link?: string }
      next?: { text?: string; link?: string }
    }
  })
}
