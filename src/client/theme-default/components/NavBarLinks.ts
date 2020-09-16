import { computed } from 'vue'
import { useSiteData, useSiteDataByRoute } from 'vitepress'
import NavBarLink from './NavBarLink.vue'
import NavDropdownLink from './NavDropdownLink.vue'
import NavRepoLink from './NavRepoLink.vue'

export default {
  components: {
    NavBarLink,
    NavDropdownLink,
    NavRepoLink
  },

  setup() {
    return {
      navData:
        process.env.NODE_ENV === 'production'
          ? // navbar items do not change in production
            useSiteDataByRoute().value.themeConfig.nav
          : // use computed in dev for hot reload
            computed(() => useSiteDataByRoute().value.themeConfig.nav),
      editLinkConfig: computed(() => useSiteData().value.themeConfig.editLink)
    }
  }
}
