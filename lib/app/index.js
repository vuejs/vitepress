import {
  createApp,
  ref,
  h,
  provide,
  inject,
  watchEffect,
  shallowRef
} from '/@modules/vue'
import { Layout } from '/@theme/index.js'

const PathSymbol = Symbol()

const App = {
  setup() {
    const path = ref(location.pathname)

    window.addEventListener(
      'click',
      (e) => {
        if (e.target.tagName === 'A') {
          const { href, target } = e.target
          if (
            target !== `_blank` &&
            href.startsWith(`${location.protocol}//${location.host}`)
          ) {
            e.preventDefault()
            // TODO save scroll position
            history.pushState(null, '', href)
            path.value = location.pathname
          }
        }
      },
      { capture: true }
    )

    window.addEventListener('popstate', (e) => {
      // TODO restore scroll position
      path.value = location.pathname
    })

    provide(PathSymbol, path)

    return () => h(Layout)
  }
}

const Default404 = () => '404 Not Found'

const Content = {
  setup() {
    const path = inject(PathSymbol)
    const comp = shallowRef()

    watchEffect(() => {
      let pagePath = path.value.replace(/\.html$/, '')
      if (pagePath.endsWith('/')) {
        pagePath += 'index'
      }

      // awlays force re-fetch content in dev
      import(`${pagePath}.md?t=${Date.now()}`)
        .then((m) => {
          comp.value = m.default
        })
        .catch((err) => {
          comp.value = Default404
        })
    })

    return () => (comp.value ? h(comp.value) : null)
  }
}

const app = createApp(App)

app.component('Content', Content)

app.mount('#app')
