// Customized pre-fetch for page chunks based on
// https://github.com/GoogleChromeLabs/quicklink

import { useNetwork } from '@vueuse/core'
import { computed, onMounted, onUnmounted, watch } from 'vue'

import { EXTERNAL_URL_RE } from '../../shared'
import { getRoutableLinkUrl, useRoute } from '../router'
import { inBrowser, pathToFile } from '../utils'

const hasFetched = new Set<string>()
const createLink = () => document.createElement('link')

const viaDOM = (url: string, onError: () => void) => {
  const link = createLink()
  link.rel = `prefetch`
  if (EXTERNAL_URL_RE.test(url)) link.crossOrigin = ''
  link.href = url
  link.onerror = () => {
    link.remove()
    onError()
  }
  document.head.appendChild(link)
}

const viaXHR = (url: string, onError: () => void) => {
  const req = new XMLHttpRequest()
  req.open('GET', url, true)
  req.withCredentials = !EXTERNAL_URL_RE.test(url)
  req.onerror = onError
  req.send()
}

export function usePrefetch() {
  if (!inBrowser) {
    return
  }

  const { isOnline, saveData, effectiveType } = useNetwork()
  const isWeak = computed(
    () =>
      !isOnline.value || saveData.value || !!effectiveType.value?.includes('2g')
  )

  const prefetch = createLink().relList.supports('prefetch') ? viaDOM : viaXHR
  const rIC = window.requestIdleCallback || setTimeout
  let observer: IntersectionObserver | null = null

  const observeLinks = () => {
    if (observer) {
      observer.disconnect()
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // skip fetching if the network is slow/offline
        // but still keep observing the link for when the network gets better
        if (!entry.isIntersecting || isWeak.value) return

        const link = entry.target as HTMLAnchorElement | SVGAElement
        observer!.unobserve(link)

        const url = getRoutableLinkUrl(link)
        const pageChunkPath = url && pathToFile(url.pathname)
        if (!pageChunkPath || hasFetched.has(pageChunkPath)) return

        hasFetched.add(pageChunkPath)
        prefetch(pageChunkPath, () => hasFetched.delete(pageChunkPath))
      })
    })

    rIC(() => {
      document
        .querySelectorAll<HTMLAnchorElement | SVGAElement>('#app a')
        .forEach((link) => {
          // links left to the browser load a fresh page with its lean chunk
          const url = getRoutableLinkUrl(link)
          if (url && url.pathname !== location.pathname) {
            observer!.observe(link)
          }
        })
    })
  }

  onMounted(observeLinks)

  const route = useRoute()
  watch(
    () => route.path,
    () => {
      // visited pages already have their full chunk, unlike the initial page
      // which only has the lean one
      const pageChunkPath = pathToFile(location.pathname)
      if (pageChunkPath) hasFetched.add(pageChunkPath)
      observeLinks()
    }
  )

  onUnmounted(() => {
    observer && observer.disconnect()
  })
}
