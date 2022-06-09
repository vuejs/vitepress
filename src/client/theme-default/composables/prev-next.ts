import { computed } from 'vue'
import { useData } from 'vitepress'
import { isActive } from '../support/utils'
import { getSidebar, getFlatSideBarLinks } from '../support/sidebar'

export function usePrevNext() {
  const { page, theme } = useData()

  return computed(() => {
    const sidebar = getSidebar(theme.value.sidebar, page.value.relativePath)
    const { links: candidates, edges } = getFlatSideBarLinks(sidebar)

    const index = candidates.findIndex((link) => {
      return isActive(page.value.relativePath, link.link)
    })

    const prev = { text: candidates[index - 1]?.text, link: candidates[index - 1]?.link }
    const next = { text: candidates[index + 1]?.text, link: candidates[index + 1]?.link }

    if (edges.includes(index - 1)) prev.text += ` | ${sidebar[edges.indexOf(index - 1) + 1]?.text}`
    else if (edges.includes(index)) next.text += ` | ${sidebar[edges.indexOf(index) + 1]?.text}`

    return { prev, next }
  })
}
