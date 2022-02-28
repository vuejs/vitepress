import {
  App,
  createApp as createClientApp,
  createSSRApp,
  defineAsyncComponent,
  h,
  onMounted,
  watch
} from 'vue'
import { inBrowser, pathToFile } from './utils'
import { Router, RouterSymbol, createRouter } from './router'
import { siteDataRef, useData } from './data'
import { useUpdateHead } from './composables/head'
import Theme from '/@theme/index'
import { usePrefetch } from './composables/preFetch'
import { dataSymbol, initData } from './data'
import { Content } from './components/Content'
import { ClientOnly } from './components/ClientOnly'

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

  if (inBrowser) {
    // dynamically update head tags
    useUpdateHead(router.route, data.site)
  }

  // install global components
  app.component('Content', Content)
  app.component('ClientOnly', ClientOnly)
  app.component(
    'Debug',
    import.meta.env.PROD
      ? () => null
      : defineAsyncComponent(() => import('./components/Debug.vue'))
  )

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

  return { app, router }
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

    // in browser: native dynamic import
    if (inBrowser) {
      isInitialPageLoad = false

      return import(/*@vite-ignore*/ pageFilePath)
    }

    // SSR: sync require
    // @ts-ignore
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

  // wait until page component is fetched before mounting
  router.go().then(() => {
    app.mount('#app')
  })
}
