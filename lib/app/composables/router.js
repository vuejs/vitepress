import { shallowReactive, provide, inject, nextTick } from 'vue'
import Theme from '/@theme/index'
import { hot } from '@hmr'

const NotFound = Theme.NotFound || (() => '404 Not Found')

/**
 * @typedef {{
 *   path: string
 *   contentComponent: import('vue').Component | null
 *   pageData: { path: string } | null
 * }} Route
 *
 * @typedef {{
 *   route: Route
 *   go: (href: string) => Promise<void>
 * }} Router
 */

/**
 * @type {import('vue').InjectionKey<Router>}
 */
const RouterSymbol = Symbol()

/**
 * @returns {Route}
 */
const getDefaultRoute = () => ({
  path: '/',
  contentComponent: null,
  pageData: null
})

/**
 * @returns {Router}
 */
export function initRouter() {
  const route = shallowReactive(getDefaultRoute())
  const inBrowser = typeof window !== 'undefined'

  if (__DEV__ && inBrowser) {
    // hot reload pageData
    hot.on('vitepress:pageData', (data) => {
      if (
        data.path.replace(/\.md$/, '') ===
        location.pathname.replace(/\.html$/, '')
      ) {
        route.pageData = data.pageData
      }
    })
  }

  /**
   * @param {string} href
   * @returns {Promise<void>}
   */
  function go(href) {
    if (inBrowser) {
      // save scroll position before changing url
      history.replaceState({ scrollPosition: window.scrollY }, document.title)
      history.pushState(null, '', href)
    }
    return loadPage(href)
  }

  /**
   * @param {string} href
   * @param {number} scrollPosition
   * @returns {Promise<void>}
   */
  function loadPage(href, scrollPosition = 0) {
    const targetLoc = new URL(href)
    const pendingPath = (route.path = targetLoc.pathname)
    let pagePath = pendingPath.replace(/\.html$/, '')
    if (pagePath.endsWith('/')) {
      pagePath += 'index'
    }

    if (__DEV__) {
      // awlays force re-fetch content in dev
      pagePath += `.md?t=${Date.now()}`
    } else {
      pagePath += `.md.js`
    }

    return import(pagePath)
      .then(async (m) => {
        if (route.path === pendingPath) {
          route.contentComponent = m.default
          route.pageData = m.__pageData
          await nextTick()

          if (targetLoc.hash && !scrollPosition) {
            /**
             * @type {HTMLElement | null}
             */
            const target = document.querySelector(targetLoc.hash)
            if (target) {
              scrollPosition = target.offsetTop
            }
          }

          window.scrollTo({
            left: 0,
            top: scrollPosition,
            behavior: 'auto'
          })
        }
      })
      .catch((err) => {
        if (!err.message.match(/fetch/)) {
          throw err
        } else if (route.path === pendingPath) {
          route.contentComponent = NotFound
        }
      })
  }

  if (inBrowser) {
    window.addEventListener(
      'click',
      /**
       * @param {*} e
       */
      (e) => {
        if (e.target.tagName === 'A') {
          const { href, target } = e.target
          const targetUrl = new URL(href)
          const currentUrl = window.location
          if (
            target !== `_blank` &&
            targetUrl.protocol === currentUrl.protocol &&
            targetUrl.hostname === currentUrl.hostname
          ) {
            if (targetUrl.pathname === currentUrl.pathname) {
              // smooth scroll bewteen hash anchors in the same page
              if (targetUrl.hash !== currentUrl.hash) {
                e.preventDefault()
                window.scrollTo({
                  left: 0,
                  top: e.target.offsetTop,
                  behavior: 'smooth'
                })
              }
            } else {
              e.preventDefault()
              go(href)
            }
          }
        }
      },
      { capture: true }
    )

    window.addEventListener(
      'popstate',
      /**
       * @param {*} e
       */
      (e) => {
        loadPage((e.state && e.state.scrollPosition) || 0)
      }
    )
  }

  /**
   * @type {Router}
   */
  const router = {
    route,
    go
  }

  provide(RouterSymbol, router)

  loadPage(location.href)

  return router
}

/**
 * @return {Router}
 */
export function useRouter() {
  const router = inject(RouterSymbol)
  if (__DEV__ && !router) {
    throw new Error(
      'useRouter() is called without initRouter() in an ancestor component.'
    )
  }
  // @ts-ignore
  return router
}

/**
 * @returns {Route}
 */
export function useRoute() {
  return useRouter().route
}
