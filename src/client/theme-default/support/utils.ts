import { withBase, useData } from 'vitepress'
import { isExternal } from '../../shared.js'

export { isExternal, isActive } from '../../shared.js'

export function throttleAndDebounce(fn: () => void, delay: number): () => void {
  let timeoutId: NodeJS.Timeout
  let called = false

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (!called) {
      fn()
      called = true
      setTimeout(() => {
        called = false
      }, delay)
    } else {
      timeoutId = setTimeout(fn, delay)
    }
  }
}

export function ensureStartingSlash(path: string): string {
  return /^\//.test(path) ? path : `/${path}`
}

export function normalizeLink(url: string): string {
  if (isExternal(url)) {
    return url
  }

  const { site } = useData()
  const { pathname, search, hash } = new URL(url, 'http://example.com')

  const normalizedPath =
    pathname.endsWith('/') || pathname.endsWith('.html')
      ? url
      : `${pathname.replace(
          /(\.md)?$/,
          site.value.cleanUrls === 'disabled' ? '.html' : ''
        )}${search}${hash}`

  return withBase(normalizedPath)
}
