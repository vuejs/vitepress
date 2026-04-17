import type { Component, InjectionKey } from 'vue'
import { inject, markRaw, nextTick, reactive, readonly } from 'vue'
import type { Awaitable, PageData, PageDataPayload } from '../../shared'
import { notFoundPageData } from '../../shared'
import { siteDataRef } from '../data'
import { inBrowser, withBase } from '../utils'
import { createLegacyRouterStrategy } from './legacy'
import {
  createNavigationApiRouterStrategy,
  hasNavigationApi
} from './navigationApi'
import {
  fakeHost,
  scrollTo,
  type PageLoadOptions,
  type Route,
  type Router,
  type RouterStrategy,
  type RouterStrategyFactory
} from './shared'

export { scrollTo }
export type { Route, Router } from './shared'

export const RouterSymbol: InjectionKey<Router> = Symbol()

const getDefaultRoute = (): Route => ({
  path: '/',
  hash: '',
  query: '',
  component: null,
  data: notFoundPageData
})

interface PageModule {
  __pageData: PageData
  default: Component
}

export function createRouter(
  loadPageModule: (path: string) => Awaitable<PageModule | null>,
  fallbackComponent?: Component
): Router {
  const route = reactive(getDefaultRoute())

  function syncRouteQueryAndHash(
    loc: { search: string; hash: string } = inBrowser
      ? location
      : { search: '', hash: '' }
  ) {
    route.query = loc.search
    route.hash = decodeURIComponent(loc.hash)
  }

  // Forward reference: strategies receive `loadPage` at setup time but call
  // it only after setup returns, by which point `loadPageImpl` is bound.
  let loadPageImpl: (href: string, options?: PageLoadOptions) => Promise<void>
  const loadPage = (href: string, options?: PageLoadOptions) =>
    loadPageImpl(href, options)

  // `go` is populated once the strategy is built; until then we use a stub so
  // the router object is usable for `router.route` / hook assignment.
  const router: Router = { route, go: async () => {} }

  const strategyFactory: RouterStrategyFactory =
    inBrowser && hasNavigationApi()
      ? createNavigationApiRouterStrategy
      : createLegacyRouterStrategy

  const strategy: RouterStrategy = strategyFactory({
    router,
    loadPage,
    syncRouteQueryAndHash
  })

  router.go = strategy.go

  let latestPendingPath: string | null = null

  async function loadPageInternal(
    href: string,
    {
      scrollPosition = 0,
      isRetry = false,
      initialLoad = false
    }: PageLoadOptions & { isRetry?: boolean } = {}
  ): Promise<void> {
    if ((await router.onBeforePageLoad?.(href)) === false) return

    const targetLoc = new URL(href, fakeHost)
    const pendingPath = (latestPendingPath = targetLoc.pathname)

    try {
      let page = await loadPageModule(pendingPath)
      if (!page) throw new Error(`Page not found: ${pendingPath}`)

      if (latestPendingPath === pendingPath) {
        latestPendingPath = null

        const { default: comp, __pageData } = page
        if (!comp) throw new Error(`Invalid route component: ${comp}`)

        await router.onAfterPageLoad?.(href)

        route.path = inBrowser ? pendingPath : withBase(pendingPath)
        route.component = markRaw(comp)
        route.data = import.meta.env.PROD
          ? markRaw(__pageData)
          : (readonly(__pageData) as PageData)
        syncRouteQueryAndHash(targetLoc)

        if (inBrowser) {
          nextTick(() => {
            let actualPathname =
              siteDataRef.value.base +
              __pageData.relativePath.replace(/(?:(^|\/)index)?\.md$/, '$1')

            if (!siteDataRef.value.cleanUrls && !actualPathname.endsWith('/')) {
              actualPathname += '.html'
            }

            if (actualPathname !== targetLoc.pathname) {
              targetLoc.pathname = actualPathname
              href = actualPathname + targetLoc.search + targetLoc.hash
              strategy.replaceUrl(href)
            }

            if (!initialLoad) scrollTo(targetLoc.hash, scrollPosition)
          })
        }
      }
    } catch (err: any) {
      if (
        !/fetch|Page not found/.test(err.message) &&
        !/^\/404(\.html|\/)?$/.test(href)
      ) {
        console.error(err)
      }

      // retry on fetch fail: the page to hash map may have been invalidated
      // because a new deploy happened while the page is open. Try to fetch
      // the updated pageToHash map and fetch again.
      if (!isRetry) {
        try {
          const res = await fetch(siteDataRef.value.base + 'hashmap.json')
          ;(window as any).__VP_HASH_MAP__ = await res.json()
          await loadPageInternal(href, {
            scrollPosition,
            isRetry: true,
            initialLoad
          })
          return
        } catch (e) {}
      }

      if (latestPendingPath === pendingPath) {
        latestPendingPath = null
        route.path = inBrowser ? pendingPath : withBase(pendingPath)
        route.component = fallbackComponent ? markRaw(fallbackComponent) : null
        const relativePath = inBrowser
          ? route.path
              .replace(/(^|\/)$/, '$1index')
              .replace(/(\.html)?$/, '.md')
              .slice(siteDataRef.value.base.length)
          : '404.md'
        route.data = { ...notFoundPageData, relativePath }
        syncRouteQueryAndHash(targetLoc)
      }
    }
  }

  loadPageImpl = loadPageInternal

  handleHMR(route)

  return router
}

export function useRouter(): Router {
  const router = inject(RouterSymbol)
  if (!router) throw new Error('useRouter() is called without provider.')
  return router
}

export function useRoute(): Route {
  return useRouter().route
}

function handleHMR(route: Route): void {
  // update route.data on HMR updates of active page
  if (import.meta.hot) {
    // hot reload pageData
    import.meta.hot.on('vitepress:pageData', (payload: PageDataPayload) => {
      if (shouldHotReload(payload)) route.data = payload.pageData
    })
  }
}

function shouldHotReload(payload: PageDataPayload): boolean {
  const payloadPath = payload.path.replace(/(?:(^|\/)index)?\.md$/, '$1')
  const locationPath = location.pathname
    .replace(/(?:(^|\/)index)?\.html$/, '')
    .slice(siteDataRef.value.base.length - 1)
  return payloadPath === locationPath
}
