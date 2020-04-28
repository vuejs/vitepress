import { reactive, provide } from 'vue'

/**
 * @type {import('vue').InjectionKey<{ path: string, scrollPosition: number }>}
 */
export const RouteSymbol = Symbol()

export function useRouter() {
  const loc = location
  const route = reactive({
    path: loc.pathname,
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
            route.path = loc.pathname
            route.scrollPosition = 0
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
      route.path = location.pathname
      route.scrollPosition = (e.state && e.state.scrollPosition) || 0
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
