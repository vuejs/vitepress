import { createApp, h, inject, watchEffect, shallowRef, nextTick } from 'vue'
import { Layout } from '/@theme/index.js'
import { useRouter, RouteSymbol } from './composables/router.js'

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

const Default404 = () => '404 Not Found'

const Content = {
  setup() {
    const comp = shallowRef()

    if (typeof window !== 'undefined') {
      /**
       * @type {{ path: string, scrollPosition: number }}
       */
      const route = inject(RouteSymbol, {
        path: '/',
        scrollPosition: 0
      })

      watchEffect(() => {
        const pendingPath = route.path
        let pagePath = pendingPath.replace(/\.html$/, '')
        if (pagePath.endsWith('/')) {
          pagePath += 'index'
        }

        // awlays force re-fetch content in dev
        import(`${pagePath}.md?t=${Date.now()}`)
          .then(async (m) => {
            if (route.path === pendingPath) {
              comp.value = m.default
              await nextTick()
              window.scrollTo({
                left: 0,
                top: route.scrollPosition,
                behavior: 'auto'
              })
            }
          })
          .catch((err) => {
            if (route.path === pendingPath) {
              comp.value = Default404
            }
          })
      })
    } else {
      // TODO SSR
    }

    return () => (comp.value ? h(comp.value) : null)
  }
}

const app = createApp(App)

app.component('Content', Content)

app.mount('#app')
