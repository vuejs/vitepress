import { computed } from 'vue'
import { useSiteData } from 'vitepress'
import NavBarLink from './NavBarLink.vue'

export default {
  components: {
    NavBarLink
  },

  setup() {
    return {
      navData:
        process.env.NODE_ENV === 'production'
          ? // navbar items do not change in production
            useSiteData().value.themeConfig.nav
          : // use computed in dev for hot reload
            computed(() => useSiteData().value.themeConfig.nav)
    }
  }
}
