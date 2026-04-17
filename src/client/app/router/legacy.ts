import { nextTick } from 'vue'
import { treatAsHtml } from '../../shared'
import { inBrowser } from '../utils'
import {
  fakeHost,
  hasTextFragment,
  normalizeHref,
  scrollTo,
  type GoOptions,
  type RouterStrategyFactory
} from './shared'

/**
 * History API + DOM-event based router strategy. This is the fallback used
 * when the Navigation API is unavailable, and it also serves the SSR path.
 */
export const createLegacyRouterStrategy: RouterStrategyFactory = (ctx) => {
  const { router, loadPage, syncRouteQueryAndHash } = ctx

  async function go(href: string, options?: GoOptions): Promise<void> {
    const { hash } = new URL(href, fakeHost)
    const textFrag = hasTextFragment(hash)
    href = normalizeHref(href)

    if ((await router.onBeforeRouteChange?.(href)) === false) return

    if (
      !inBrowser ||
      (await changeRoute(href, { ...options, hasTextFragment: textFrag }))
    ) {
      await loadPage(href)
      if (inBrowser && !options?.initialLoad) {
        // wait for Vue to render the new component before scrolling so the
        // hash target (if any) is in the DOM
        await nextTick()
        scrollTo(new URL(href, fakeHost).hash)
      }
    }
    if (textFrag) {
      // this will create a new history entry, but that's almost unavoidable
      location.hash = hash
    }
    syncRouteQueryAndHash()
    await router.onAfterRouteChange?.(href)
  }

  if (inBrowser) {
    if (history.state === null) history.replaceState({}, '')

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
        ) {
          return
        }

        const link = e.target.closest<HTMLAnchorElement | SVGAElement>('a')
        if (
          !link ||
          link.closest('.vp-raw') ||
          link.hasAttribute('download') ||
          link.hasAttribute('target')
        ) {
          return
        }

        const linkHref =
          link.getAttribute('href') ??
          (link instanceof SVGAElement ? link.getAttribute('xlink:href') : null)
        if (linkHref == null) return

        const { href, origin, pathname } = new URL(linkHref, link.baseURI)
        const currentLoc = new URL(location.href) // copy to keep old data
        // only intercept inbound html links
        if (origin === currentLoc.origin && treatAsHtml(pathname)) {
          e.preventDefault()
          router.go(href)
        }
      },
      { capture: true }
    )

    window.addEventListener('popstate', async (e) => {
      if (e.state === null) return
      const href = normalizeHref(location.href)
      await loadPage(href)
      await nextTick()
      scrollTo(new URL(href, fakeHost).hash, e.state.scrollPosition || 0)
      syncRouteQueryAndHash()
      await router.onAfterRouteChange?.(href)
    })

    window.addEventListener('hashchange', (e) => {
      e.preventDefault()
      syncRouteQueryAndHash()
    })
  }

  return {
    go,
    replaceUrl(href) {
      history.replaceState({}, '', href)
    }
  }
}

async function changeRoute(
  href: string,
  { initialLoad = false, replace = false, hasTextFragment = false } = {}
): Promise<boolean> {
  const loc = normalizeHref(location.href)
  const nextUrl = new URL(href, location.origin)
  const currentUrl = new URL(loc, location.origin)

  if (href === loc) {
    if (!initialLoad) {
      if (!hasTextFragment) scrollTo(nextUrl.hash)
      return false
    }
  } else {
    if (replace) {
      history.replaceState({}, '', href)
    } else {
      // save scroll position before changing URL
      history.replaceState({ scrollPosition: window.scrollY }, '')
      history.pushState({}, '', href)
    }

    if (nextUrl.pathname === currentUrl.pathname) {
      // scroll between hash anchors on the same page, avoid duplicate entries
      if (nextUrl.hash !== currentUrl.hash) {
        window.dispatchEvent(
          new HashChangeEvent('hashchange', {
            oldURL: currentUrl.href,
            newURL: nextUrl.href
          })
        )
        if (!hasTextFragment) scrollTo(nextUrl.hash)
      }

      return false
    }
  }

  return true
}
