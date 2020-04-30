import { createApp as createClientApp, createSSRApp, ref, readonly } from 'vue'
import { createRouter, RouterSymbol } from './router'
import { useUpdateHead } from './composables/head'
import { siteDataRef } from './composables/siteData'
import { pageDataSymbol } from './composables/pageData'
import { Content } from './components/Content'
import Debug from './components/Debug.vue'
import Theme from '/@theme/index'
import { hot } from '@hmr'

const inBrowser = typeof window !== 'undefined'

const NotFound = Theme.NotFound || (() => '404 Not Found')

export function createApp() {
  // unlike site data which is static across all requests, page data is
  // distinct per-request.
  const pageDataRef = ref()

  if (inBrowser) {
    // dynamically update head tags
    useUpdateHead(pageDataRef)
  }

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
      pagePath = './' + pagePath.slice(1).replace(/\//g, '_') + '.md.js'
    }

    if (inBrowser) {
      // in browser: native dynamic import
      return import(pagePath).then((page) => {
        if (page.__pageData) {
          pageDataRef.value = readonly(JSON.parse(page.__pageData))
        }
        return page.default
      })
    } else {
      // SSR, sync require
      const page = require(pagePath)
      pageDataRef.value = JSON.parse(page.__pageData)
      return page.default
    }
  }, NotFound)

  const app = __DEV__
    ? createClientApp(Theme.Layout)
    : createSSRApp(Theme.Layout)

  app.provide(RouterSymbol, router)
  app.provide(pageDataSymbol, pageDataRef)

  app.component('Content', Content)
  app.component('Debug', __DEV__ ? Debug : () => null)

  Object.defineProperties(app.config.globalProperties, {
    $site: {
      get() {
        return siteDataRef.value
      }
    },
    $page: {
      get() {
        return pageDataRef.value
      }
    }
  })

  if (Theme.enhanceApp) {
    Theme.enhanceApp({
      app,
      router,
      siteData: siteDataRef
    })
  }

  return { app, router }
}

if (inBrowser) {
  const { app, router } = createApp()
  // wait unitl page component is fetched before mounting
  router.go().then(() => {
    app.mount('#app')
  })
}
