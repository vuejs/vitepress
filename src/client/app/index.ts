import { App, createApp as createClientApp, createSSRApp } from 'vue'
import { inBrowser, pathToFile } from './utils'
import { Router, RouterSymbol, createRouter } from './router'
import { mixinGlobalComputed, mixinGlobalComponents } from './mixin'
import { siteDataRef } from './composables/siteData'
import { useSiteDataByRoute } from './composables/siteDataByRoute'
import { usePageData } from './composables/pageData'
import { useUpdateHead } from './composables/head'
import Theme from '/@theme/index'

const NotFound = Theme.NotFound || (() => '404 Not Found')

export function createApp() {
  const router = newRouter()

  handleHMR(router)

  const app = newApp()

  app.provide(RouterSymbol, router)

  const siteDataByRouteRef = useSiteDataByRoute(router.route)
  const pageDataRef = usePageData(router.route)

  if (inBrowser) {
    // dynamically update head tags
    useUpdateHead(router.route, siteDataByRouteRef)
  }

  mixinGlobalComputed(app, siteDataRef, siteDataByRouteRef, pageDataRef)
  mixinGlobalComponents(app)

  if (Theme.enhanceApp) {
    Theme.enhanceApp({
      app,
      router,
      siteData: siteDataRef
    })
  }

  return { app, router }
}

function newApp(): App {
  return process.env.NODE_ENV === 'production'
    ? createSSRApp(Theme.Layout)
    : createClientApp(Theme.Layout)
}

function newRouter(): Router {
  let isInitialPageLoad = inBrowser
  let initialPath: string

  return createRouter((path) => {
    let pageFilePath = pathToFile(path)

    if (isInitialPageLoad) {
      initialPath = pageFilePath
    }

    // use lean build if this is the initial page load or navigating back
    // to the initial loaded path (the static vnodes already adopted the
    // static content on that load so no need to re-fetch the page)
    if (isInitialPageLoad || initialPath === pageFilePath) {
      pageFilePath = pageFilePath.replace(/\.js$/, '.lean.js')
    }

    // in browser: native dynamic import
    if (inBrowser) {
      isInitialPageLoad = false

      return import(/*@vite-ignore*/ pageFilePath)
    }

    // SSR: sync require
    return require(pageFilePath)
  }, NotFound)
}

function handleHMR(router: Router): void {
  // update route.data on HMR updates of active page
  if (import.meta.hot) {
    // hot reload pageData
    import.meta.hot!.on('vitepress:pageData', (payload) => {
      if (shouldHotReload(payload)) {
        router.route.data = payload.pageData
      }
    })
  }
}

function shouldHotReload(payload: any): boolean {
  const payloadPath = payload.path.replace(/(\bindex)?\.md$/, '')
  const locationPath = location.pathname.replace(/(\bindex)?\.html$/, '')

  return payloadPath === locationPath
}

if (inBrowser) {
  const { app, router } = createApp()

  // wait unitl page component is fetched before mounting
  router.go().then(() => {
    app.mount('#app')
  })
}
