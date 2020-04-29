import { reactive, provide, inject, nextTick, markRaw } from 'vue'

/**
 * @typedef {import('vue').Component} Component
 *
 * @typedef {{
 *   path: string
 *   contentComponent: Component | null
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
  contentComponent: null
})

/**
 * @param {(route: Route) => Component | Promise<Component>} loadComponent
 * @param {Component} [fallbackComponent]
 * @returns {Router}
 */
export function initRouter(loadComponent, fallbackComponent) {
  const route = reactive(getDefaultRoute())
  const inBrowser = typeof window !== 'undefined'

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
  async function loadPage(href, scrollPosition = 0) {
    // we are just using URL to parse the pathname and hash - the base doesn't
    // matter and is only passed to support same-host hrefs.
    const targetLoc = new URL(href, `http://vuejs.org`)
    const pendingPath = (route.path = targetLoc.pathname)

    try {
      let comp = loadComponent(route)
      // only await if it returns a Promise - this allows sync resolution
      // on initial render in SSR.
      if ('then' in comp && typeof comp.then === 'function') {
        comp = await comp
      }
      if (route.path === pendingPath) {
        route.contentComponent = markRaw(comp)
        if (inBrowser) {
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
      }
    } catch (err) {
      if (!err.message.match(/fetch/)) {
        throw err
      } else if (route.path === pendingPath) {
        route.contentComponent = fallbackComponent
          ? markRaw(fallbackComponent)
          : null
      }
    }
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
        loadPage(location.href, (e.state && e.state.scrollPosition) || 0)
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
