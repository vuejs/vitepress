import { treatAsHtml } from '../../shared'
import {
  fakeHost,
  hasTextFragment,
  normalizeHref,
  scrollTo,
  type GoOptions,
  type RouterStrategyFactory
} from './shared'

/**
 * Feature-detect the Navigation API. We gate on `sourceElement` since that
 * property is newer than `intercept()` itself — its presence gives us a
 * sufficiently complete implementation to replace the legacy listeners.
 */
export function hasNavigationApi(): boolean {
  return (
    typeof window !== 'undefined' &&
    'navigation' in window &&
    typeof NavigateEvent !== 'undefined' &&
    'sourceElement' in NavigateEvent.prototype
  )
}

/**
 * Navigation API based router strategy. Requires a browser environment where
 * {@link hasNavigationApi} returns true.
 */
export const createNavigationApiRouterStrategy: RouterStrategyFactory = (
  ctx
) => {
  const { router, loadPage, syncRouteQueryAndHash } = ctx

  // Guard against re-entering the navigate listener for our own same-document
  // URL fix-up via history.replaceState inside loadPage.
  let skipInternalNavigate = false

  async function go(href: string, options?: GoOptions): Promise<void> {
    const { hash } = new URL(href, fakeHost)
    const textFrag = hasTextFragment(hash)
    href = normalizeHref(href)

    if (options?.initialLoad) {
      // Initial load: the document is already at this URL; just render the
      // page component without going through the Navigation API.
      if ((await router.onBeforeRouteChange?.(href)) === false) return
      await loadPage(href, { initialLoad: true })
      if (textFrag) location.hash = hash
      syncRouteQueryAndHash()
      await router.onAfterRouteChange?.(href)
      return
    }

    // Run the before-route-change hook here so we can cancel synchronously
    // before committing the URL via navigation.navigate().
    if ((await router.onBeforeRouteChange?.(href)) === false) return

    const currentHref = normalizeHref(location.href)
    if (href === currentHref) {
      if (!textFrag) scrollTo(new URL(href, fakeHost).hash)
      syncRouteQueryAndHash()
      await router.onAfterRouteChange?.(href)
      return
    }

    try {
      await navigation.navigate(href, {
        history: options?.replace ? 'replace' : 'push',
        info: { __vpFromGo: true }
      }).finished
    } catch {
      // navigation was cancelled or errored; listener / navigateerror
      // handles any observable side effects.
    }
  }

  navigation.addEventListener('navigate', (event) => {
    if (skipInternalNavigate) return
    if (!event.canIntercept) return
    if (event.downloadRequest != null) return
    if (event.formData) return

    const src = event.sourceElement
    // Mirror the legacy click-handler filters when the navigation was
    // element-initiated (e.g. link click). Programmatic navigations have a
    // null sourceElement and are always considered eligible.
    if (src) {
      if (src.closest('.vp-raw')) return
      // covers docsearch action buttons and button-wrapped link content
      if (src.closest('button') || src.querySelector('button')) return
      if (
        (src instanceof HTMLAnchorElement || src instanceof SVGAElement) &&
        (src.hasAttribute('download') || src.hasAttribute('target'))
      ) {
        return
      }
    }

    const destUrl = new URL(event.destination.url)
    if (destUrl.origin !== location.origin) return
    if (!treatAsHtml(destUrl.pathname)) return

    const rawHash = destUrl.hash
    const textFrag = hasTextFragment(rawHash)

    // Text-fragment hash navigations rely on the browser's native
    // fragment-directive handling; skip interception.
    if (event.hashChange && textFrag) return

    const href = normalizeHref(event.destination.url)
    const fromGo = !!event.info?.__vpFromGo
    const isTraverse = event.navigationType === 'traverse'

    let scrollPosition = 0
    if (isTraverse) {
      const state = event.destination.getState() as
        | { scrollPosition?: number }
        | undefined
      scrollPosition = state?.scrollPosition || 0
    } else {
      // Persist current scroll position on the outgoing entry so that
      // back/forward traversals can restore it.
      try {
        navigation.updateCurrentEntry({
          state: {
            ...(navigation.currentEntry?.getState() || {}),
            scrollPosition: window.scrollY
          }
        })
      } catch {}
    }

    event.intercept({
      scroll: 'manual',
      focusReset: 'manual',
      async handler() {
        if (!fromGo) {
          if ((await router.onBeforeRouteChange?.(href)) === false) {
            throw new Error('Route change cancelled')
          }
        }

        if (event.hashChange) {
          if (!textFrag) scrollTo(rawHash)
        } else {
          await loadPage(href, { scrollPosition })
          if (textFrag) location.hash = rawHash
        }

        syncRouteQueryAndHash()
        await router.onAfterRouteChange?.(href)
      }
    })
  })

  // Fragment-directive navigations skip interception above and fall back to
  // native browser handling, so keep a hashchange listener to sync
  // route.hash / route.query in that path.
  window.addEventListener('hashchange', (e) => {
    e.preventDefault()
    syncRouteQueryAndHash()
  })

  return {
    go,
    replaceUrl(href) {
      skipInternalNavigate = true
      history.replaceState({}, '', href)
      skipInternalNavigate = false
    }
  }
}
