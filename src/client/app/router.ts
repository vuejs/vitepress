import type { Component, InjectionKey } from 'vue'
import { inject, markRaw, nextTick, reactive, readonly } from 'vue'
import type { Awaitable, PageData, PageDataPayload } from '../shared'
import { notFoundPageData, treatAsHtml } from '../shared'
import { siteDataRef } from './data'
import { getScrollOffset, inBrowser, withBase } from './utils'

export interface Route {
  path: string
  data: PageData
  component: Component | null
}

export interface Router {
  /**
   * Current route.
   */
  route: Route
  /**
   * Navigate to a new URL.
   */
  go: (to?: string) => Promise<void>
  /**
   * Called before the route changes. Return `false` to cancel the navigation.
   */
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>
  /**
   * Called before the page component is loaded (after the history state is
   * updated). Return `false` to cancel the navigation.
   */
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>
  /**
   * Called after the route changes.
   */
  onAfterRouteChanged?: (to: string) => Awaitable<void>
}

export const RouterSymbol: InjectionKey<Router> = Symbol()

// we are just using URL to parse the pathname and hash - the base doesn't
// matter and is only passed to support same-host hrefs.
const fakeHost = 'http://a.com'

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
  loadPageModule: (path: string) => Awaitable<PageModule | null>,
  fallbackComponent?: Component
): Router {
  const route = reactive(getDefaultRoute())

  const router: Router = {
    route,
    go
  }

  async function go(href: string = inBrowser ? location.href : '/') {
    href = normalizeHref(href)
    if ((await router.onBeforeRouteChange?.(href)) === false) return
    if (inBrowser && href !== normalizeHref(location.href)) {
      // save scroll position before changing url
      history.replaceState({ scrollPosition: window.scrollY }, '')
      history.pushState({}, '', href)
    }
    await loadPage(href)
    await router.onAfterRouteChanged?.(href)
  }

  let latestPendingPath: string | null = null

  async function loadPage(href: string, scrollPosition = 0, isRetry = false) {
    if ((await router.onBeforePageLoad?.(href)) === false) return
    const targetLoc = new URL(href, fakeHost)
    const pendingPath = (latestPendingPath = targetLoc.pathname)
    try {
      let page = await loadPageModule(pendingPath)
      if (!page) {
        throw new Error(`Page not found: ${pendingPath}`)
      }
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
              history.replaceState({}, '', href)
            }

            if (targetLoc.hash && !scrollPosition) {
              let target: HTMLElement | null = null
              try {
                target = document.getElementById(
                  decodeURIComponent(targetLoc.hash).slice(1)
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
          await loadPage(href, scrollPosition, true)
          return
        } catch (e) {}
      }

      if (latestPendingPath === pendingPath) {
        latestPendingPath = null
        route.path = inBrowser ? pendingPath : withBase(pendingPath)
        route.component = fallbackComponent ? markRaw(fallbackComponent) : null
        const relativePath = inBrowser
          ? pendingPath
              .replace(/(^|\/)$/, '$1index')
              .replace(/(\.html)?$/, '.md')
              .replace(/^\//, '')
          : '404.md'
        route.data = { ...notFoundPageData, relativePath }
      }
    }
  }

  if (inBrowser) {
    if (history.state === null) {
      history.replaceState({}, '')
    }
    window.addEventListener(
      'click',
      (e) => {
        if (
          e.defaultPrevented ||
          !(e.target instanceof Element) ||
          e.target.closest('button') || // temporary fix for docsearch action buttons
          e.button !== 0 ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.metaKey
        )
          return

        const link = e.target.closest<HTMLAnchorElement | SVGAElement>('a')
        if (
          !link ||
          link.closest('.vp-raw') ||
          link.hasAttribute('download') ||
          link.hasAttribute('target')
        )
          return

        const linkHref =
          link.getAttribute('href') ??
          (link instanceof SVGAElement ? link.getAttribute('xlink:href') : null)
        if (linkHref == null) return

        const { href, origin, pathname, hash, search } = new URL(
          linkHref,
          link.baseURI
        )
        const currentUrl = new URL(location.href) // copy to keep old data
        // only intercept inbound html links
        if (origin === currentUrl.origin && treatAsHtml(pathname)) {
          e.preventDefault()
          if (
            pathname === currentUrl.pathname &&
            search === currentUrl.search
          ) {
            // scroll between hash anchors in the same page
            // avoid duplicate history entries when the hash is same
            if (hash !== currentUrl.hash) {
              history.pushState({}, '', href)
              // still emit the event so we can listen to it in themes
              window.dispatchEvent(
                new HashChangeEvent('hashchange', {
                  oldURL: currentUrl.href,
                  newURL: href
                })
              )
            }
            if (hash) {
              // use smooth scroll when clicking on header anchor links
              scrollTo(link, hash, link.classList.contains('header-anchor'))
            } else {
              window.scrollTo(0, 0)
            }
          } else {
            go(href)
          }
        }
      },
      { capture: true }
    )

    window.addEventListener('popstate', async (e) => {
      if (e.state === null) {
        return
      }
      await loadPage(
        normalizeHref(location.href),
        (e.state && e.state.scrollPosition) || 0
      )
      router.onAfterRouteChanged?.(location.href)
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

export function scrollTo(el: Element, hash: string, smooth = false) {
  let target: Element | null = null

  try {
    target = el.classList.contains('header-anchor')
      ? el
      : document.getElementById(decodeURIComponent(hash).slice(1))
  } catch (e) {
    console.warn(e)
  }

  if (target) {
    const targetPadding = parseInt(
      window.getComputedStyle(target).paddingTop,
      10
    )
    const targetTop =
      window.scrollY +
      target.getBoundingClientRect().top -
      getScrollOffset() +
      targetPadding
    function scrollToTarget() {
      // only smooth scroll if distance is smaller than screen height.
      if (!smooth || Math.abs(targetTop - window.scrollY) > window.innerHeight)
        window.scrollTo(0, targetTop)
      else window.scrollTo({ left: 0, top: targetTop, behavior: 'smooth' })
    }
    requestAnimationFrame(scrollToTarget)
  }
}

function handleHMR(route: Route): void {
  // update route.data on HMR updates of active page
  if (import.meta.hot) {
    // hot reload pageData
    import.meta.hot.on('vitepress:pageData', (payload: PageDataPayload) => {
      if (shouldHotReload(payload)) {
        route.data = payload.pageData
      }
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

function normalizeHref(href: string): string {
  const url = new URL(href, fakeHost)
  url.pathname = url.pathname.replace(/(^|\/)index(\.html)?$/, '$1')
  // ensure correct deep link so page refresh lands on correct files.
  if (siteDataRef.value.cleanUrls)
    url.pathname = url.pathname.replace(/\.html$/, '')
  else if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html'))
    url.pathname += '.html'
  return url.pathname + url.search + url.hash
}
