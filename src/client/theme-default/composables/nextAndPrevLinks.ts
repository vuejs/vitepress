import { computed } from 'vue'
import { useRoute, useSiteData } from 'vitepress'
import { DefaultTheme } from '../config'

export function useNextAndPrevLinks() {
  const route = useRoute()
  // TODO: could this be useSiteData<DefaultTheme.Config> or is the siteData
  // resolved and has a different structure?
  const siteData = useSiteData()

  const resolveLink = (targetLink: string) => {
    let target: DefaultTheme.SideBarLink | undefined
    Object.keys(siteData.value.themeConfig.sidebar).some((k) => {
      return siteData.value.themeConfig.sidebar[k].some(
        (v: { children: any }) => {
          if (Array.isArray(v.children)) {
            target = v.children.find((value: any) => {
              return value.link === targetLink
            })
          }
          return !!target
        }
      )
    })
    return target
  }

  const next = computed(() => {
    const pageData = route.data
    if (pageData.frontmatter.next === false) {
      return undefined
    }
    if (typeof pageData.frontmatter.next === 'string') {
      return resolveLink(pageData.frontmatter.next)
    }
    return pageData.next
  })

  const prev = computed(() => {
    const pageData = route.data
    if (pageData.frontmatter.prev === false) {
      return undefined
    }
    if (typeof pageData.frontmatter.prev === 'string') {
      return resolveLink(pageData.frontmatter.prev)
    }
    return pageData.prev
  })

  const hasLinks = computed(() => {
    return !!next.value || !!prev.value
  })

  return {
    next,
    prev,
    hasLinks
  }
}
