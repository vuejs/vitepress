import { reactive, inject, markRaw, nextTick, readonly } from 'vue'
import type { Component, InjectionKey } from 'vue'
import { PageData, notFoundPageData } from '../shared'
import { inBrowser, withBase } from './utils'
import { siteDataRef } from './data'

export interface Route {
  path: string
  data: PageData
  component: Component | null
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
  component: null,
  data: notFoundPageData
})

interface PageModule {
  __pageData: string
  default: Component
}

export function createRouter(
  loadPageModule: (path: string) => PageModule | Promise<PageModule>,
  fallbackComponent?: Component
): Router {
  const route = reactive(getDefaultRoute())

  function go(href: string = inBrowser ? location.href : '/') {
    // ensure correct deep link so page refresh lands on correct files.
    const url = new URL(href, fakeHost)
    if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) {
      url.pathname += '.html'
      href = url.pathname + url.search + url.hash
    }
    if (inBrowser) {
      // save scroll position before changing url
      history.replaceState({ scrollPosition: window.scrollY }, document.title)
      history.pushState(null, '', href)
    }
    return loadPage(href)
  }

  let latestPendingPath: string | null = null

  async function loadPage(href: string, scrollPosition = 0, isRetry = false) {
    const targetLoc = new URL(href, fakeHost)
    const pendingPath = (latestPendingPath = targetLoc.pathname)
    try {
      let page = loadPageModule(pendingPath)
      // only await if it returns a Promise - this allows sync resolution
      // on initial render in SSR.
      if ('then' in page && typeof page.then === 'function') {
        page = await page
      }
      if (latestPendingPath === pendingPath) {
        latestPendingPath = null

        const { default: comp, __pageData } = page as PageModule
        if (!comp) {
          throw new Error(`Invalid route component: ${comp}`)
        }

        route.path = inBrowser ? pendingPath : withBase(pendingPath)
        route.component = markRaw(comp)
        route.data = import.meta.env.PROD
          ? markRaw(JSON.parse(__pageData))
          : (readonly(JSON.parse(__pageData)) as PageData)

        if (inBrowser) {
          nextTick(() => {
            if (targetLoc.hash && !scrollPosition) {
              let target: HTMLElement | null = null
              try {
                target = document.querySelector(
                  decodeURIComponent(targetLoc.hash)
                ) as HTMLElement
              } catch (e) {
                console.warn(e)
              }
              if (target) {
                scrollTo(target, targetLoc.hash)
                return
              }
            }
            window.scrollTo(0, scrollPosition)
          })
        }
      }
    } catch (err: any) {
      if (!err.message.match(/fetch/) && !href.match(/^[\\/]404\.html$/)) {
        console.error(err)
      }

      // retry on fetch fail: the page to hash map may have been invalidated
      // because a new deploy happened while the page is open. Try to fetch
      // the updated pageToHash map and fetch again.
      if (!isRetry) {
        try {
          const res = await fetch(siteDataRef.value.base + 'hashmap.json')
          ;(window as any).__VP_HASH_MAP__ = await res.json()
          await loadPage(href, scrollPosition, true)
          return
        } catch (e) {}
      }

      if (latestPendingPath === pendingPath) {
        latestPendingPath = null
        route.path = inBrowser ? pendingPath : withBase(pendingPath)
        route.component = fallbackComponent ? markRaw(fallbackComponent) : null
        route.data = notFoundPageData
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
          const extMatch = pathname.match(/\.\w+$/)
          // only intercept inbound links
          if (
            !e.ctrlKey &&
            !e.shiftKey &&
            !e.altKey &&
            !e.metaKey &&
            target !== `_blank` &&
            protocol === currentUrl.protocol &&
            hostname === currentUrl.hostname &&
            !(extMatch && extMatch[0] !== '.html')
          ) {
            e.preventDefault()
            if (pathname === currentUrl.pathname) {
              // scroll between hash anchors in the same page
              if (hash && hash !== currentUrl.hash) {
                history.pushState(null, '', hash)
                // still emit the event so we can listen to it in themes
                window.dispatchEvent(new Event('hashchange'))
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
  let target: Element | null = null

  try {
    target = el.classList.contains('header-anchor')
      ? el
      : document.querySelector(decodeURIComponent(hash))
  } catch (e) {
    console.warn(e)
  }

  if (target) {
    let offset = siteDataRef.value.scrollOffset
    if (typeof offset === 'string') {
      offset =
        document.querySelector(offset)!.getBoundingClientRect().bottom + 24
    }
    const targetPadding = parseInt(
      window.getComputedStyle(target as HTMLElement).paddingTop,
      10
    )
    const targetTop =
      window.scrollY +
      (target as HTMLElement).getBoundingClientRect().top -
      offset +
      targetPadding
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
