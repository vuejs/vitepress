import { shallowReactive, provide, inject, nextTick } from 'vue'
import Theme from '/@theme/index'
import { hot } from '@hmr'

const NotFound = Theme.NotFound || (() => '404 Not Found')

/**
 * @typedef {{
 *   path: string
 *   contentComponent: import('vue').Component | null
 *   pageData: { path: string } | null
 * }} Route
 */

/**
 * @type {import('vue').InjectionKey<Route>}
 */
const RouteSymbol = Symbol()

/**
 * @returns {Route}
 */
const getDefaultRoute = () => ({
  path: location.pathname,
  contentComponent: null,
  pageData: null
})

export function useRouter() {
  const loc = location
  const route = shallowReactive(getDefaultRoute())

  if (__DEV__) {
    // hot reload pageData
    hot.on('vitepress:pageData', (data) => {
      if (
        data.path.replace(/\.md$/, '') ===
        location.pathname.replace(/\.html$/, '')
      ) {
        route.pageData = data.pageData
      }
    })
  }

  window.addEventListener(
    'click',
    /**
     * @param {*} e
     */
    (e) => {
      if (e.target.tagName === 'A') {
        const { href, target } = e.target
        const url = new URL(href)
        if (
          target !== `_blank` &&
          url.protocol === loc.protocol &&
          url.hostname === loc.hostname
        ) {
          if (url.pathname === loc.pathname) {
            // smooth scroll bewteen hash anchors in the same page
            if (url.hash !== loc.hash) {
              e.preventDefault()
              window.scrollTo({
                left: 0,
                top: e.target.offsetTop,
                behavior: 'smooth'
              })
            }
          } else {
            e.preventDefault()
            // save scroll position before changing url
            saveScrollPosition()
            history.pushState(null, '', href)
            loadPage(route)
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
      loadPage(route, (e.state && e.state.scrollPosition) || 0)
    }
  )

  provide(RouteSymbol, route)

  loadPage(route)
}

export function useRoute() {
  return inject(RouteSymbol) || getDefaultRoute()
}

/**
 * @param {Route} route
 * @param {number} scrollPosition
 */
function loadPage(route, scrollPosition = 0) {
  const pendingPath = (route.path = location.pathname)
  let pagePath = pendingPath.replace(/\.html$/, '')
  if (pagePath.endsWith('/')) {
    pagePath += 'index'
  }

  if (__DEV__) {
    // awlays force re-fetch content in dev
    pagePath += `.md?t=${Date.now()}`
  } else {
    pagePath += `.md.js`
  }

  import(pagePath)
    .then(async (m) => {
      if (route.path === pendingPath) {
        route.contentComponent = m.default
        route.pageData = m.__pageData
        await nextTick()

        if (location.hash && !scrollPosition) {
          /**
           * @type {HTMLElement | null}
           */
          const target = document.querySelector(location.hash)
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
    })
    .catch((err) => {
      if (!err.message.match(/fetch/)) {
        throw err
      } else if (route.path === pendingPath) {
        route.contentComponent = NotFound
      }
    })
}

function saveScrollPosition() {
  history.replaceState(
    {
      scrollPosition: window.scrollY
    },
    document.title,
    ''
  )
}
