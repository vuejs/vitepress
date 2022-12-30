import {
  App,
  createApp as createClientApp,
  createSSRApp,
  defineComponent,
  h,
  onMounted,
  watch
} from 'vue'
import Theme from '@theme/index'
import { inBrowser, pathToFile } from './utils.js'
import { Router, RouterSymbol, createRouter } from './router.js'
import { siteDataRef, useData } from './data.js'
import { useUpdateHead } from './composables/head.js'
import { usePrefetch } from './composables/preFetch.js'
import { dataSymbol, initData } from './data.js'
import { Content } from './components/Content.js'
import { ClientOnly } from './components/ClientOnly.js'
import { useCopyCode } from './composables/copyCode.js'
import { useCodeGroups } from './composables/codeGroups.js'

const NotFound = Theme.NotFound || (() => '404 Not Found')

const VitePressApp = defineComponent({
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

    // setup global copy code handler
    useCopyCode()
    // setup global code groups handler
    useCodeGroups()

    if (Theme.setup) Theme.setup()
    return () => h(Theme.Layout)
  }
})

export function createApp() {
  const router = newRouter()

  const app = newApp()

  app.provide(RouterSymbol, router)

  const data = initData(router.route)
  app.provide(dataSymbol, data)

  // provide this to avoid circular dependency in VPContent
  app.provide('NotFound', NotFound)

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
    import('./devtools.js').then(({ setupDevtools }) =>
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

if (inBrowser) {
  const { app, router, data } = createApp()

  // wait until page component is fetched before mounting
  router.go().then(() => {
    // dynamically update head tags
    useUpdateHead(router.route, data.site)
    app.mount('#app')
  })
}
