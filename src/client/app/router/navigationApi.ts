import { nextTick } from 'vue'
import { treatAsHtml } from '../../shared'
import {
  fakeHost,
  focusHashTarget,
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
 *
 * We rely on the browser's built-in post-commit scroll (to the URL fragment
 * on push/replace, or to the restored position on traverse) and only keep
 * focus handling manual, so screen readers still land on the target heading.
 * To make sure the browser scrolls into a rendered DOM we await `nextTick()`
 * inside the intercept handler before resolving.
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
      await loadPage(href)
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
      // No navigation needed; the browser won't scroll on its own, so we
      // scroll + focus explicitly.
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

    event.intercept({
      // Scroll is left on browser default: push/replace scrolls to the URL
      // fragment (or top), traverse restores the previously-committed scroll
      // position. Focus is kept manual so our hash-target focus logic wins.
      focusReset: 'manual',
      async handler() {
        if (!fromGo) {
          if ((await router.onBeforeRouteChange?.(href)) === false) {
            throw new Error('Route change cancelled')
          }
        }

        if (event.hashChange) {
          // Same document, no render needed.
          if (!textFrag) focusHashTarget(rawHash)
        } else {
          await loadPage(href)
          // Ensure Vue has applied the new component to the DOM so the
          // browser's post-handler scroll lands on the right element.
          await nextTick()
          if (textFrag) {
            location.hash = rawHash
          } else if (!isTraverse && rawHash) {
            // Focus the hash target for a11y; the browser will handle the
            // scroll once the handler resolves.
            focusHashTarget(rawHash)
          }
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
