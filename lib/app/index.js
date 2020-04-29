import { createApp, h, readonly } from 'vue'
import { Content } from './components/Content'
import { initRouter } from './composables/router'
import { useSiteData } from './composables/siteData'
import { initPageData, usePageData } from './composables/pageData'
import Theme from '/@theme/index'
import { hot } from '@hmr'

const inBrowser = typeof window !== 'undefined'

const NotFound = Theme.NotFound || (() => '404 Not Found')

const App = {
  setup() {
    const pageDataRef = initPageData()

    initRouter((route) => {
      let pagePath = route.path.replace(/\.html$/, '')
      if (pagePath.endsWith('/')) {
        pagePath += 'index'
      }

      if (__DEV__) {
        // awlays force re-fetch content in dev
        pagePath += `.md?t=${Date.now()}`
      } else {
        // in production, each .md file is built into a .md.js file following
        // the path conversion scheme.
        pagePath += `.md.js`
      }

      if (inBrowser) {
        // in browser: native dynamic import
        return import(pagePath).then((m) => {
          pageDataRef.value = readonly(m.__pageData)
          return m.default
        })
      } else {
        // SSR, sync require
        return require(pagePath).default
      }
    }, NotFound)

    if (__DEV__ && inBrowser) {
      // hot reload pageData
      hot.on('vitepress:pageData', (data) => {
        if (
          data.path.replace(/\.md$/, '') ===
          location.pathname.replace(/\.html$/, '')
        ) {
          pageDataRef.value = data.pageData
        }
      })
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
