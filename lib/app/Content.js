import { h, shallowRef, watchEffect, inject, nextTick } from 'vue'
import { RouteSymbol } from './router'

const Default404 = () => '404 Not Found'

export const Content = {
  setup() {
    const comp = shallowRef()

    if (typeof window !== 'undefined') {
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
