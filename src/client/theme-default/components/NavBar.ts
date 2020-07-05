import { computed } from 'vue'
import { useSiteDataByRoute } from 'vitepress'
import NavBarLink from './NavBarLink.vue'
import NavDropdownLink from './NavDropdownLink.vue'

export default {
  components: {
    NavBarLink,
    NavDropdownLink
  },

  setup() {
    return {
      navData:
        process.env.NODE_ENV === 'production'
          ? // navbar items do not change in production
            useSiteDataByRoute().value.themeConfig.nav
          : // use computed in dev for hot reload
            computed(() => useSiteDataByRoute().value.themeConfig.nav)
    }
  }
}
