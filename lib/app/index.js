import {
  createApp,
  ref,
  h,
  provide,
  inject,
  watchEffect,
  shallowRef
} from 'vue'
import { Layout } from '/@theme/index.js'

const PathSymbol = Symbol()

const App = {
  setup() {
    const path = ref(window.location.pathname)

    // window.addEventListener('click', e => {
    //   if (e.target.tagName === 'A') {
    //     e.preventDefault()
    //     if (e.target.href && e.target.href.indexOf(location.host)) {
    //       history.pushState(null, '', e.target.href)
    //     }
    //   }
    // })

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
        pagePath += 'index.md'
      } else {
        pagePath += '.md'
      }

      import(pagePath)
        .then((m) => {
          comp.value = m.default
        })
        .catch(err => {
          comp.value = Default404
        })
    })

    return () => (comp.value ? h(comp.value) : null)
  }
}

const app = createApp(App)

app.component('Content', Content)

app.mount('#app')
