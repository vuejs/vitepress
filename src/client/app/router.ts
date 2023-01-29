import { reactive, inject, markRaw, nextTick, readonly } from 'vue'
import type { Component, InjectionKey } from 'vue'
import { notFoundPageData } from '../shared.js'
import type { PageData, PageDataPayload, Awaitable } from '../shared.js'
import { inBrowser, withBase } from './utils.js'
import { siteDataRef } from './data.js'

export interface Route {
  path: string
  data: PageData
  component: Component | null
}

export interface Router {
  route: Route
  go: (href?: string) => Promise<void>
  onBeforeRouteChange?: (to: string) => Awaitable<void>
  onAfterRouteChanged?: (to: string) => Awaitable<void>
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
  __pageData: PageData
  default: Component
}

export function createRouter(
  loadPageModule: (path: string) => Promise<PageModule>,
  fallbackComponent?: Component
): Router {
  const route = reactive(getDefaultRoute())

  const router: Router = {
    route,
    go
  }

  async function go(href: string = inBrowser ? location.href : '/') {
    await router.onBeforeRouteChange?.(href)
    const url = new URL(href, fakeHost)
    if (!siteDataRef.value.cleanUrls) {
      // ensure correct deep link so page refresh lands on correct files.
      // if cleanUrls is enabled, the server should handle this
      if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) {
        url.pathname += '.html'
        href = url.pathname + url.search + url.hash
      }
    }
    if (inBrowser && href !== location.href) {
      // save scroll position before changing url
      history.replaceState({ scrollPosition: window.scrollY }, document.title)
      history.pushState(null, '', href)
    }
    await loadPage(href)
    await router.onAfterRouteChanged?.(href)
  }

  let latestPendingPath: string | null = null

  async function loadPage(href: string, scrollPosition = 0, isRetry = false) {
    const targetLoc = new URL(href, fakeHost)
    const pendingPath = (latestPendingPath = targetLoc.pathname)
    try {
      let page = await loadPageModule(pendingPath)
      if (latestPendingPath === pendingPath) {
        latestPendingPath = null

        const { default: comp, __pageData } = page
        if (!comp) {
          throw new Error(`Invalid route component: ${comp}`)
        }

        route.path = inBrowser ? pendingPath : withBase(pendingPath)
        route.component = markRaw(comp)
        route.data = import.meta.env.PROD
          ? markRaw(__pageData)
          : (readonly(__pageData) as PageData)

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
              history.replaceState(null, '', href)
            }

            if (targetLoc.hash && !scrollPosition) {
              let target: HTMLElement | null = null
              try {
                target = document.querySelector(
                  decodeURIComponent(targetLoc.hash)
                )
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
      if (!/fetch/.test(err.message) && !/^\/404(\.html|\/)?$/.test(href)) {
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
        // temporary fix for docsearch action buttons
        const button = (e.target as Element).closest('button')
        if (button) return

        const link = (e.target as Element | SVGElement).closest<
          HTMLAnchorElement | SVGAElement
        >('a')
        if (
          link &&
          !link.closest('.vp-raw') &&
          (link instanceof SVGElement || !link.download)
        ) {
          const { target } = link
          const { href, origin, pathname, hash, search } = new URL(
            link.href instanceof SVGAnimatedString
              ? link.href.animVal
              : link.href,
            link.baseURI
          )
          const currentUrl = window.location
          const extMatch = pathname.match(/\.\w+$/)
          // only intercept inbound links
          if (
            !e.ctrlKey &&
            !e.shiftKey &&
            !e.altKey &&
            !e.metaKey &&
            target !== `_blank` &&
            origin === currentUrl.origin &&
            // don't intercept if non-html extension is present
            !(extMatch && extMatch[0] !== '.html')
          ) {
            e.preventDefault()
            if (
              pathname === currentUrl.pathname &&
              search === currentUrl.search
            ) {
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

  handleHMR(route)

  return router
}

export function useRouter(): Router {
  const router = inject(RouterSymbol)
  if (!router) {
    throw new Error('useRouter() is called without provider.')
  }
  return router
}

export function useRoute(): Route {
  return useRouter().route
}

function scrollTo(el: HTMLElement | SVGElement, hash: string, smooth = false) {
  let target: HTMLElement | SVGElement | null = null

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
      window.getComputedStyle(target).paddingTop,
      10
    )
    const targetTop =
      window.scrollY +
      target.getBoundingClientRect().top -
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

function handleHMR(route: Route): void {
  // update route.data on HMR updates of active page
  if (import.meta.hot) {
    // hot reload pageData
    import.meta.hot!.on('vitepress:pageData', (payload: PageDataPayload) => {
      if (shouldHotReload(payload)) {
        route.data = payload.pageData
      }
    })
  }
}

function shouldHotReload(payload: PageDataPayload): boolean {
  const payloadPath = payload.path.replace(/(\bindex)?\.md$/, '')
  const locationPath = location.pathname.replace(/(\bindex)?\.html$/, '')
  return payloadPath === locationPath
}
