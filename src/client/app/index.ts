import { createApp as createClientApp, createSSRApp, ref, readonly } from 'vue'
import { createRouter, RouterSymbol } from './router'
import { useUpdateHead } from './composables/head'
import { siteDataRef } from './composables/siteData'
import { pageDataSymbol } from './composables/pageData'
import { Content } from './components/Content'
import Debug from './components/Debug.vue'
import Theme from '/@theme/index'
import { hot } from 'vite/hmr'

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
    let pagePath = route.path.replace(/\.html$/, '')
    if (pagePath.endsWith('/')) {
      pagePath += 'index'
    }

    if (isInitialPageLoad) {
      initialPath = pagePath
    }

    if (__DEV__) {
      // awlays force re-fetch content in dev
      pagePath += `.md?t=${Date.now()}`
    } else {
      // in production, each .md file is built into a .md.js file following
      // the path conversion scheme.
      // /foo/bar.html -> ./foo_bar.md

      if (inBrowser) {
        pagePath = pagePath.slice(__BASE__.length).replace(/\//g, '_') + '.md'
        // client production build needs to account for page hash, which is
        // injected directly in the page's html
        const pageHash = __VP_HASH_MAP__[pagePath]
        // use lean build if this is the initial page load or navigating back
        // to the initial loaded path (the static vnodes already adopted the
        // static content on that load so no need to re-fetch the page)
        const ext =
          isInitialPageLoad || initialPath === pagePath ? 'lean.js' : 'js'
        pagePath = `${__BASE__}_assets/${pagePath}.${pageHash}.${ext}`
      } else {
        // ssr build uses much simpler name mapping
        pagePath = `./${pagePath.slice(1).replace(/\//g, '_')}.md.js`
      }
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
