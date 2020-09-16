import { defineComponent, computed } from 'vue'
import { usePageData, useSiteData } from 'vitepress'
import { DefaultTheme } from '../config'

export default defineComponent({
  setup() {
    const pageData = usePageData()
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
      if (pageData.value.frontmatter.next === false) {
        return undefined
      }
      if (typeof pageData.value.frontmatter.next === 'string') {
        return resolveLink(pageData.value.frontmatter.next)
      }
      return pageData.value.next
    })
    const prev = computed(() => {
      if (pageData.value.frontmatter.prev === false) {
        return undefined
      }
      if (typeof pageData.value.frontmatter.prev === 'string') {
        return resolveLink(pageData.value.frontmatter.prev)
      }
      return pageData.value.prev
    })
    const hasLinks = computed(() => {
      return !!next || !!prev
    })
    return {
      next,
      prev,
      hasLinks
    }
  }
})
