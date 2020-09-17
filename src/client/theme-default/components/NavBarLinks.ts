import { computed } from 'vue'
import { useSiteData, useSiteDataByRoute } from 'vitepress'
import NavBarLink from './NavBarLink.vue'
import NavDropdownLink from './NavDropdownLink.vue'
import { DefaultTheme } from '../config'

const platforms = ['GitHub', 'GitLab', 'Bitbucket'].map(
  (platform) => [platform, new RegExp(platform, 'i')] as const
)

export default {
  components: {
    NavBarLink,
    NavDropdownLink
  },

  setup() {
    const siteDataByRoute = useSiteDataByRoute()
    const siteData = useSiteData()
    const repoInfo = computed(() => {
      const theme = siteData.value.themeConfig as DefaultTheme.Config
      const repo = theme.docsRepo || theme.repo
      let text: string | undefined = theme.repoLabel

      if (repo) {
        const link = /^https?:/.test(repo) ? repo : `https://github.com/${repo}`
        if (!text) {
          // if no label is provided, deduce it from the repo url
          const repoHosts = link.match(/^https?:\/\/[^/]+/)
          if (repoHosts) {
            const repoHost = repoHosts[0]
            const foundPlatform = platforms.find(([_platform, re]) =>
              re.test(repoHost)
            )
            text = foundPlatform && foundPlatform[0]
          }
        }

        return { link, text: text || 'Source' }
      }
      return null
    })
    return {
      navData:
        process.env.NODE_ENV === 'production'
          ? // navbar items do not change in production
            siteDataByRoute.value.themeConfig.nav
          : // use computed in dev for hot reload
            computed(() => siteDataByRoute.value.themeConfig.nav),
      repoInfo
    }
  }
}
