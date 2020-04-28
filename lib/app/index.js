import { createApp, h } from 'vue'
import { Layout } from '/@theme/index'
import { Content } from './Content'
import { useRouter } from './router'

const App = {
  setup() {
    if (typeof window !== 'undefined') {
      useRouter()
    } else {
      // TODO inject static route for SSR
    }
    return () => h(Layout)
  }
}

const app = createApp(App)

app.component('Content', Content)

app.mount('#app')
