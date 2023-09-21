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
import { RouterSymbol, createRouter, scrollTo, type Router } from './router'
import { inBrowser, pathToFile } from './utils'

function resolveThemeExtends(theme: typeof RawTheme): typeof RawTheme {
  if (theme.extends) {
    const base = resolveThemeExtends(theme.extends)
    return {
      ...base,
      ...theme,
      async enhanceApp(ctx) {
        if (base.enhanceApp) await base.enhanceApp(ctx)
        if (theme.enhanceApp) await theme.enhanceApp(ctx)
      }
    }
  }
  return theme
}

const Theme = resolveThemeExtends(RawTheme)

const VitePressApp = defineComponent({
  name: 'VitePressApp',
  setup() {
    const { site } = useData()

    // change the language on the HTML element based on the current lang
    onMounted(() => {
      watchEffect(() => {
        document.documentElement.lang = site.value.lang
        document.documentElement.dir = site.value.dir
      })
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
    return () => h(Theme.Layout!)
  }
})

export async function createApp() {
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
  let isInitialPageLoad = inBrowser
  let initialPath: string

  return createRouter((path) => {
    let pageFilePath = pathToFile(path)
    let pageModule = null

    if (pageFilePath) {
      if (isInitialPageLoad) {
        initialPath = pageFilePath
      }

      // use lean build if this is the initial page load or navigating back
      // to the initial loaded path (the static vnodes already adopted the
      // static content on that load so no need to re-fetch the page)
      if (isInitialPageLoad || initialPath === pageFilePath) {
        pageFilePath = pageFilePath.replace(/\.js$/, '.lean.js')
      }

      pageModule = import(/*@vite-ignore*/ pageFilePath)
    }

    if (inBrowser) {
      isInitialPageLoad = false
    }

    return pageModule
  }, Theme.NotFound)
}

if (inBrowser) {
  createApp().then(({ app, router, data }) => {
    // wait until page component is fetched before mounting
    router.go().then(() => {
      // dynamically update head tags
      useUpdateHead(router.route, data.site)
      app.mount('#app')

      // scroll to hash on new tab during dev
      if (import.meta.env.DEV && location.hash) {
        const target = document.getElementById(
          decodeURIComponent(location.hash).slice(1)
        )
        if (target) {
          scrollTo(target, location.hash)
        }
      }
    })
  })
}
