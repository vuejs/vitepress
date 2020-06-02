import { reactive, inject, markRaw, nextTick } from 'vue'
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

// we are just using URL to parse the pathname and hash - the base doesn't
// matter and is only passed to support same-host hrefs.
const fakeHost = `http://a.com`

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
    // ensure correct deep link so page refresh lands on correct files.
    const url = new URL(href, fakeHost)
    if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) {
      url.pathname += '.html'
      href = url.href
    }
    if (inBrowser) {
      // save scroll position before changing url
      history.replaceState({ scrollPosition: window.scrollY }, document.title)
      history.pushState(null, '', href)
    }
    return loadPage(href)
  }

  async function loadPage(href: string, scrollPosition = 0) {
    const targetLoc = new URL(href, fakeHost)
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
          nextTick(() => {
            if (targetLoc.hash && !scrollPosition) {
              const target = document.querySelector(
                targetLoc.hash
              ) as HTMLElement
              if (target) {
                scrollTo(target, targetLoc.hash)
                return
              }
            }
            window.scrollTo(0, scrollPosition)
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
          const { href, protocol, hostname, pathname, hash, target } = link
          const currentUrl = window.location
          // only intercept inbound links
          if (
            target !== `_blank` &&
            protocol === currentUrl.protocol &&
            hostname === currentUrl.hostname
          ) {
            e.preventDefault()
            if (pathname === currentUrl.pathname) {
              // scroll bewteen hash anchors in the same page
              if (hash && hash !== currentUrl.hash) {
                history.pushState(null, '', hash)
                // use smooth scroll when clicking on header anchor links
                scrollTo(link, hash, link.classList.contains('header-anchor'))
              }
            } else {
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

    window.addEventListener('hashchange', (e) => {
      e.preventDefault()
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

function scrollTo(el: HTMLElement, hash: string, smooth = false) {
  const pageOffset = document.getElementById('app')!.offsetTop
  const target = el.classList.contains('.header-anchor')
    ? el
    : document.querySelector(hash)
  if (target) {
    const targetTop = (target as HTMLElement).offsetTop - pageOffset - 15
    // only smooth scroll if distance is smaller than screen height.
    if (!smooth || Math.abs(targetTop - window.scrollY) > window.innerHeight) {
      window.scrollTo(0, targetTop)
    } else {
      window.scrollTo({
        left: 0,
        top: targetTop,
        behavior: 'smooth'
      })
    }
  }
}
