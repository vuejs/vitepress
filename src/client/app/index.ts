import {
  App,
  createApp as createClientApp,
  createSSRApp,
  h,
  onMounted,
  watch
} from 'vue'
import Theme from '/@theme/index'
import { inBrowser, pathToFile } from './utils'
import { Router, RouterSymbol, createRouter } from './router'
import { siteDataRef, useData } from './data'
import { useUpdateHead } from './composables/head'
import { usePrefetch } from './composables/preFetch'
import { dataSymbol, initData } from './data'
import { Content } from './components/Content'
import { ClientOnly } from './components/ClientOnly'
import { PageDataPayload } from '../shared'

const NotFound = Theme.NotFound || (() => '404 Not Found')

const VitePressApp = {
  name: 'VitePressApp',
  setup() {
    const { site } = useData()

    // change the language on the HTML element based on the current lang
    onMounted(() => {
      watch(
        () => site.value.lang,
        (lang: string) => {
          document.documentElement.lang = lang
        },
        { immediate: true }
      )
    })

    if (import.meta.env.PROD) {
      // in prod mode, enable intersectionObserver based pre-fetch
      usePrefetch()
    }
    return () => h(Theme.Layout)
  }
}

export function createApp() {
  const router = newRouter()

  handleHMR(router)

  const app = newApp()

  app.provide(RouterSymbol, router)

  const data = initData(router.route)
  app.provide(dataSymbol, data)

  // install global components
  app.component('Content', Content)
  app.component('ClientOnly', ClientOnly)

  // expose $frontmatter
  Object.defineProperty(app.config.globalProperties, '$frontmatter', {
    get() {
      return data.frontmatter.value
    }
  })

  if (Theme.enhanceApp) {
    Theme.enhanceApp({
      app,
      router,
      siteData: siteDataRef
    })
  }

  // setup devtools in dev mode
  if (import.meta.env.DEV || __VUE_PROD_DEVTOOLS__) {
    import('./devtools').then(({ setupDevtools }) =>
      setupDevtools(app, router, data)
    )
  }

  return { app, router, data }
}

function newApp(): App {
  return import.meta.env.PROD
    ? createSSRApp(VitePressApp)
    : createClientApp(VitePressApp)
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

    if (inBrowser) {
      isInitialPageLoad = false
    }

    return import(/*@vite-ignore*/ pageFilePath)
  }, NotFound)
}

function handleHMR(router: Router): void {
  // update route.data on HMR updates of active page
  if (import.meta.hot) {
    // hot reload pageData
    import.meta.hot!.on('vitepress:pageData', (payload: PageDataPayload) => {
      if (shouldHotReload(payload)) {
        router.route.data = payload.pageData
      }
    })
  }
}

function shouldHotReload(payload: PageDataPayload): boolean {
  const payloadPath = payload.path.replace(/(\bindex)?\.md$/, '')
  const locationPath = location.pathname.replace(/(\bindex)?\.html$/, '')

  return payloadPath === locationPath
}

if (inBrowser) {
  const { app, router, data } = createApp()

  // wait until page component is fetched before mounting
  router.go().then(() => {
    // dynamically update head tags
    useUpdateHead(router.route, data.site)
    app.mount('#app')
  })
}
