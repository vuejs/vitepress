import { reactive, inject, nextTick, markRaw } from 'vue'
import type { Component, InjectionKey } from 'vue'

export interface Route {
  path: string
  contentComponent: Component | null
}

export interface Router {
  route: Route
  go: (href?: string) => Promise<void>
}

export const RouterSymbol: InjectionKey<Router> = Symbol()

const getDefaultRoute = (): Route => ({
  path: '/',
  contentComponent: null
})

export function createRouter(
  loadComponent: (route: Route) => Component | Promise<Component>,
  fallbackComponent?: Component
): Router {
  const route = reactive(getDefaultRoute())
  const inBrowser = typeof window !== 'undefined'

  function go(href?: string) {
    href = href || (inBrowser ? location.href : '/')
    if (inBrowser) {
      // save scroll position before changing url
      history.replaceState({ scrollPosition: window.scrollY }, document.title)
      history.pushState(null, '', href)
    }
    return loadPage(href)
  }

  async function loadPage(href: string, scrollPosition = 0) {
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
        if (!comp) {
          throw new Error(`Invalid route component: ${comp}`)
        }
        route.contentComponent = markRaw(comp)
        if (inBrowser) {
          await nextTick()

          if (targetLoc.hash && !scrollPosition) {
            const target = document.querySelector(targetLoc.hash) as HTMLElement
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
        console.error(err)
      }
      if (route.path === pendingPath) {
        route.contentComponent = fallbackComponent
          ? markRaw(fallbackComponent)
          : null
      }
    }
  }

  if (inBrowser) {
    window.addEventListener(
      'click',
      (e) => {
        const link = (e.target as Element).closest('a')
        if (link) {
          const { href, target } = link
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
                  top: link.offsetTop,
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

    window.addEventListener('popstate', (e) => {
      loadPage(location.href, (e.state && e.state.scrollPosition) || 0)
    })
  }

  return {
    route,
    go
  }
}

export function useRouter(): Router {
  const router = inject(RouterSymbol)
  if (!router) {
    throw new Error('useRouter() is called without provider.')
  }
  // @ts-ignore
  return router
}

export function useRoute(): Route {
  return useRouter().route
}
