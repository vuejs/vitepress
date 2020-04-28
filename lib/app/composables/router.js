import { reactive, provide } from 'vue'

export const RouteSymbol = Symbol()

export function useRouter() {
  const route = reactive({
    path: location.pathname,
    scrollPosition: window.scrollY
  })

  window.addEventListener(
    'click',
    /**
     * @param {*} e
     */
    (e) => {
      if (e.target.tagName === 'A') {
        const { href, target } = e.target
        if (
          target !== `_blank` &&
          href.startsWith(`${location.protocol}//${location.host}`)
        ) {
          e.preventDefault()
          // save scroll position before changing url
          saveScrollPosition()
          history.pushState(null, '', href)
          route.path = location.pathname
          route.scrollPosition = 0
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
      route.path = location.pathname
      route.scrollPosition = e.state && e.state.scrollPosition || 0
    }
  )

  provide(RouteSymbol, route)
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
