import { defineComponent, computed } from 'vue'
import OutboundLink from './icons/OutboundLink.vue'
import { endingSlashRE, isExternal } from '/@theme/utils'
import { usePageData, useSiteData, useSiteDataByRoute } from 'vitepress'

function createEditLink(
  repo: string,
  docsRepo: string,
  docsDir: string,
  docsBranch: string,
  path: string
) {
  const bitbucket = /bitbucket.org/
  if (bitbucket.test(repo)) {
    const base = isExternal(docsRepo) ? docsRepo : repo
    return (
      base.replace(endingSlashRE, '') +
      `/src` +
      `/${docsBranch}/` +
      (docsDir ? docsDir.replace(endingSlashRE, '') + '/' : '') +
      path +
      `?mode=edit&spa=0&at=${docsBranch}&fileviewer=file-view-default`
    )
  }

  const base = isExternal(docsRepo)
    ? docsRepo
    : `https://github.com/${docsRepo}`
  return (
    base.replace(endingSlashRE, '') +
    `/edit` +
    `/${docsBranch}/` +
    (docsDir ? docsDir.replace(endingSlashRE, '') + '/' : '') +
    path
  )
}

export default defineComponent({
  components: {
    OutboundLink
  },

  setup() {
    const pageData = usePageData()
    const siteData = useSiteData()
    const siteDataByRoute = useSiteDataByRoute()

    const {
      repo,
      text,
      dir = '',
      branch = 'master',
      docsRepo = repo
    } = siteData.value.themeConfig.editLink
    const { relativePath } = pageData.value

    const editLink = computed(() => {
      const showEditLink =
        pageData.value.frontmatter.editLink == null
          ? siteData.value.themeConfig.editLink
          : pageData.value.frontmatter.editLink

      if (showEditLink && relativePath) {
        return createEditLink(repo, docsRepo, dir, branch, relativePath)
      }
      return null
    })
    const editLinkText = computed(() => {
      return (
        siteDataByRoute.value.themeConfig.editLink.text ||
        text ||
        `Edit this page`
      )
    })

    return {
      editLink,
      editLinkText
    }
  }
})
