import type { Component } from 'vue'
import type { Awaitable, PageData } from '../../shared'
import { siteDataRef } from '../data'

export interface Route {
  path: string
  hash: string
  query: string
  data: PageData
  component: Component | null
}

export interface GoOptions {
  // @internal
  initialLoad?: boolean
  // Whether to replace the current history entry.
  replace?: boolean
}

export interface Router {
  /**
   * Current route.
   */
  route: Route
  /**
   * Navigate to a new URL.
   */
  go: (to: string, options?: GoOptions) => Promise<void>
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
   * Called after the page component is loaded (before the page component is updated).
   */
  onAfterPageLoad?: (to: string) => Awaitable<void>
  /**
   * Called after the route changes.
   */
  onAfterRouteChange?: (to: string) => Awaitable<void>
}

export interface PageLoadOptions {
  scrollPosition?: number
  initialLoad?: boolean
}

export type LoadPage = (
  href: string,
  options?: PageLoadOptions
) => Promise<void>

export type SyncRouteQueryAndHash = (loc?: {
  search: string
  hash: string
}) => void

export interface RouterStrategyContext {
  router: Router
  loadPage: LoadPage
  syncRouteQueryAndHash: SyncRouteQueryAndHash
}

export interface RouterStrategy {
  go: Router['go']
  /**
   * Replace the current URL without triggering a new navigation through this
   * strategy's listeners. Used by `loadPage` to fix up the URL to match the
   * canonical path once the page component has been resolved.
   */
  replaceUrl: (href: string) => void
}

export type RouterStrategyFactory = (
  ctx: RouterStrategyContext
) => RouterStrategy

// we are just using URL to parse the pathname and hash - the base doesn't
// matter and is only passed to support same-host hrefs
export const fakeHost = 'http://a.com'

export function normalizeHref(href: string): string {
  const url = new URL(href, fakeHost)
  url.pathname = url.pathname.replace(/(^|\/)index(\.html)?$/, '$1')
  // ensure correct deep link so page refresh lands on correct files
  if (siteDataRef.value.cleanUrls) {
    url.pathname = url.pathname.replace(/\.html$/, '')
  } else if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) {
    url.pathname += '.html'
  }
  return url.pathname + url.search + url.hash.split(':~:')[0]
}

export function hasTextFragment(hash: string): boolean {
  return (
    typeof document !== 'undefined' &&
    !!document.fragmentDirective &&
    hash.includes(':~:')
  )
}

export function scrollTo(hash: string, scrollPosition = 0): void {
  if (!hash || scrollPosition) {
    window.scrollTo(0, scrollPosition)
    return
  }

  let target: HTMLElement | null = null
  try {
    target = document.getElementById(decodeURIComponent(hash).slice(1))
  } catch (e) {
    console.warn(e)
  }
  if (!target) return

  const scrollToTarget = () => {
    target.scrollIntoView({ block: 'start' })

    // focus the target element for better accessibility
    target.focus({ preventScroll: true })

    // return if focus worked
    if (document.activeElement === target) return

    // element has tabindex already, likely not focusable
    // because of some other reason, bail out
    if (target.hasAttribute('tabindex')) return

    const restoreTabindex = () => {
      target.removeAttribute('tabindex')
      target.removeEventListener('blur', restoreTabindex)
    }

    // temporarily make the target element focusable
    target.setAttribute('tabindex', '-1')
    target.addEventListener('blur', restoreTabindex)

    // try to focus again
    target.focus({ preventScroll: true })

    // remove tabindex and event listener if focus still not worked
    if (document.activeElement !== target) restoreTabindex()
  }

  requestAnimationFrame(scrollToTarget)
}
