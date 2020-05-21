// Customized pre-fetch for page chunks based on
// https://github.com/GoogleChromeLabs/quicklink

import { onMounted, onUnmounted, onUpdated } from 'vue'
import { inBrowser, pathToFile } from '../utils'

const hasFetched = new Set<string>()
const createLink = () => document.createElement('link')

const viaDOM = (url: string) => {
  const link = createLink()
  link.rel = `prefetch`
  link.href = url
  document.head.appendChild(link)
}

const viaXHR = (url: string) => {
  const req = new XMLHttpRequest()
  req.open('GET', url, (req.withCredentials = true))
  req.send()
}

let link
const doFetch: (url: string) => void =
  inBrowser &&
  (link = createLink()) &&
  link.relList &&
  link.relList.supports &&
  link.relList.supports('prefetch')
    ? viaDOM
    : viaXHR

export function usePrefetch() {
  if (!inBrowser) {
    return
  }

  if (!window.IntersectionObserver) {
    return
  }

  let conn
  if (
    (conn = (navigator as any).connection) &&
    (conn.saveData || /2g/.test(conn.effectiveType))
  ) {
    // Don't prefetch if using 2G or if Save-Data is enabled.
    return
  }

  const rIC = (window as any).requestIdleCallback || setTimeout
  let observer: IntersectionObserver | null = null

  const observeLinks = () => {
    if (observer) {
      observer.disconnect()
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement
          observer!.unobserve(link)
          const { pathname } = link
          if (!hasFetched.has(pathname)) {
            hasFetched.add(pathname)
            const pageChunkPath = pathToFile(pathname)
            doFetch(pageChunkPath)
          }
        }
      })
    })

    rIC(() => {
      document.querySelectorAll('.vitepress-content a').forEach((link) => {
        if ((link as HTMLAnchorElement).hostname === location.hostname) {
          observer!.observe(link)
        }
      })
    })
  }

  onMounted(observeLinks)
  onUpdated(observeLinks)

  onUnmounted(() => {
    observer && observer.disconnect()
  })
}
