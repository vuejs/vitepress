import { createApp, h } from 'vue'
import { Content } from './components/Content'
import { useRouter } from './composables/router'
import { useSiteData } from './composables/data'
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

Object.defineProperty(app.config.globalProperties, '$site', {
  get: useSiteData
})

app.component('Content', Content)

app.mount('#app')
