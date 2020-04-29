import { createApp as createClientApp, createSSRApp, ref, readonly } from 'vue'
import { Content } from './components/Content'
import { createRouter, RouterSymbol } from './router'
import { useSiteData } from './composables/siteData'
import { usePageData, pageDataSymbol } from './composables/pageData'
import Theme from '/@theme/index'
import { hot } from '@hmr'

const inBrowser = typeof window !== 'undefined'

const NotFound = Theme.NotFound || (() => '404 Not Found')

export function createApp() {
  const pageDataRef = ref()

  // hot reload pageData
  if (__DEV__ && inBrowser) {
    hot.on('vitepress:pageData', (data) => {
      if (
        data.path.replace(/\.md$/, '') ===
        location.pathname.replace(/\.html$/, '')
      ) {
        pageDataRef.value = data.pageData
      }
    })
  }

  const router = createRouter((route) => {
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
      // /foo/bar.html -> /js/foo_bar.md.js
      // TODO handle base
      pagePath = pagePath.slice(1).replace(/\//g, '_') + '.md.js'
    }

    if (inBrowser) {
      // in browser: native dynamic import
      // js files are stored in a sub directory
      return import('./js/' + pagePath).then(page => {
        pageDataRef.value = readonly(page.__pageData)
        return page.default
      })
    } else {
      // SSR, sync require
      const page = require('./' + pagePath)
      console.log('setting page data')
      pageDataRef.value = page.__pageData
      return page.default
    }
  }, NotFound)

  const app = __DEV__
    ? createClientApp(Theme.Layout)
    : createSSRApp(Theme.Layout)

  app.provide(RouterSymbol, router)
  app.provide(pageDataSymbol, pageDataRef)

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

  return { app, router }
}

if (inBrowser) {
  createApp().app.mount('#app')
}
