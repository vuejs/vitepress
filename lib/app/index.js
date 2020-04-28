import { createApp, h } from 'vue'
import { Content } from './components/Content'
import { useRouter } from './composables/router'
import { useSiteData } from './composables/siteData'
import { usePageData } from './composables/pageData'
import Theme from '/@theme/index'

const App = {
  setup() {
    if (typeof window !== 'undefined') {
      useRouter()
    } else {
      // TODO inject static route for SSR
    }
    return () => h(Theme.Layout)
  }
}

const app = createApp(App)

app.component('Content', Content)

app.mixin({
  beforeCreate() {
    const siteRef = useSiteData()
    const pageRef = usePageData()
    Object.defineProperties(this, {
      $site: {
        get: () => siteRef.value
      },
      $page: {
        get: () => pageRef.value
      }
    })
  }
})

app.mount('#app')
