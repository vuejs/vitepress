import RawTheme from '@theme/index'
import {
  createApp as createClientApp,
  createSSRApp,
  defineComponent,
  h,
  onMounted,
  watchEffect,
  type App
} from 'vue'

import { ClientOnly } from './components/ClientOnly'
import { Content } from './components/Content'
import { useCodeGroups } from './composables/codeGroups'
import { useCopyCode } from './composables/copyCode'
import { useUpdateHead } from './composables/head'
import { usePrefetch } from './composables/preFetch'
import { dataSymbol, initData, siteDataRef, useData } from './data'
import {
  RouterSymbol,
  createRouter,
  isLoadFailure,
  scrollTo,
  type Router
} from './router'
import { resolveNotFound, resolveThemeExtends } from './theme'
import { inBrowser, pathToFile } from './utils'

const Theme = resolveThemeExtends(RawTheme)

// a pre-rendered not-found document is never hydrated: the host may serve
// it for any path, so its markup can belong to another page or locale
const isNotFoundDocument = () =>
  inBrowser &&
  !!document.getElementById('app')?.hasAttribute('data-vp-not-found')

const VitePressApp = defineComponent({
  name: 'VitePressApp',
  setup() {
    const { site, lang, dir } = useData()

    // change the language on the HTML element based on the current lang
    onMounted(() => {
      watchEffect(() => {
        document.documentElement.lang = lang.value
        document.documentElement.dir = dir.value
      })
    })

    if (import.meta.env.PROD && site.value.router.prefetchLinks) {
      // in prod mode, enable intersectionObserver based pre-fetch
      usePrefetch()
    }

    // setup global copy code handler
    useCopyCode()
    // setup global code groups handler
    useCodeGroups()

    if (Theme.setup) Theme.setup()
    return () => h(Theme.Layout!)
  }
})

export async function createApp() {
  ;(globalThis as any).__VITEPRESS__ = true

  const router = newRouter()

  const app = newApp()

  app.provide(RouterSymbol, router)

  const data = initData(router.route)
  app.provide(dataSymbol, data)

  // install global components
  app.component('Content', Content)
  app.component('ClientOnly', ClientOnly)

  // expose $frontmatter & $params
  Object.defineProperties(app.config.globalProperties, {
    $frontmatter: {
      get() {
        return data.frontmatter.value
      }
    },
    $params: {
      get() {
        return data.page.value.params
      }
    }
  })

  // set before enhanceApp so users can still disable it or take over with their own errorHandler;
  // unhandled errors then fail the build instead of silently shipping broken pages
  if (import.meta.env.SSR) {
    app.config.throwUnhandledErrorInProduction = true
  }

  if (Theme.enhanceApp) {
    await Theme.enhanceApp({
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
  // the lean build leaves the static content to the pre-rendered markup, so
  // it only fits a page that is going to be hydrated
  let isInitialPageLoad = inBrowser && !isNotFoundDocument()

  return createRouter((path) => {
    let pageFilePath = pathToFile(path)
    let pageModule = null

    if (pageFilePath) {
      // use lean build if this is the initial page load
      if (isInitialPageLoad) {
        pageFilePath = pageFilePath.replace(/\.js$/, '.lean.js')
      }

      if (import.meta.env.DEV) {
        pageModule = import(/*@vite-ignore*/ pageFilePath).catch((e) => {
          // page load could fail for other reasons, don't swallow
          if (!isLoadFailure(e)) console.error(e)
          // try with/without trailing slash
          // in prod this is handled in src/client/app/utils.ts#pathToFile
          const url = new URL(pageFilePath!, 'http://a.com')
          const path =
            (url.pathname.endsWith('/index.md')
              ? url.pathname.slice(0, -9) + '.md'
              : url.pathname.slice(0, -3) + '/index.md') +
            url.search +
            url.hash
          return import(/*@vite-ignore*/ path)
        })
      } else {
        pageModule = import(/*@vite-ignore*/ pageFilePath)
      }
    }

    if (inBrowser) {
      isInitialPageLoad = false
    }

    return pageModule
  }, resolveNotFound(RawTheme))
}

if (inBrowser) {
  createApp().then(({ app, router, data }) => {
    // wait until page component is fetched before mounting
    router.go(location.href, { initialLoad: true }).then(() => {
      // dynamically update head tags
      useUpdateHead(router.route, data.site)
      if (import.meta.env.PROD && isNotFoundDocument()) {
        document.getElementById('app')!.replaceChildren()
      }
      app.mount('#app')

      // scroll to hash on new tab during dev
      if (import.meta.env.DEV && location.hash) {
        setTimeout(() => scrollTo(location.hash), 100)
      }
    })
  })
}
