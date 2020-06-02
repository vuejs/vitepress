import { createApp as createClientApp, createSSRApp, ref, readonly } from 'vue'
import { createRouter, RouterSymbol } from './router'
import { useUpdateHead } from './composables/head'
import { siteDataRef } from './composables/siteData'
import { pageDataSymbol } from './composables/pageData'
import { Content } from './components/Content'
import Debug from './components/Debug.vue'
import Theme from '/@theme/index'
import { inBrowser, pathToFile } from './utils'

const NotFound = Theme.NotFound || (() => '404 Not Found')

export function createApp() {
  // unlike site data which is static across all requests, page data is
  // distinct per-request.
  const pageDataRef = ref()

  if (inBrowser) {
    // dynamically update head tags
    useUpdateHead(pageDataRef)
  }

  if (import.meta.hot) {
    // hot reload pageData
    import.meta.hot!.on('vitepress:pageData', (data) => {
      if (
        data.path.replace(/(\bindex)?\.md$/, '') ===
        location.pathname.replace(/(\bindex)?\.html$/, '')
      ) {
        pageDataRef.value = data.pageData
      }
    })
  }

  let isInitialPageLoad = inBrowser
  let initialPath: string

  const router = createRouter((route) => {
    let pagePath = pathToFile(route.path)

    if (isInitialPageLoad) {
      initialPath = pagePath
    }

    // use lean build if this is the initial page load or navigating back
    // to the initial loaded path (the static vnodes already adopted the
    // static content on that load so no need to re-fetch the page)
    if (isInitialPageLoad || initialPath === pagePath) {
      pagePath = pagePath.replace(/\.js$/, '.lean.js')
    }

    if (inBrowser) {
      isInitialPageLoad = false
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
    },
    $theme: {
      get() {
        return siteDataRef.value.themeConfig
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
