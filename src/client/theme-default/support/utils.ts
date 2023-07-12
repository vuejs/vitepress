import { withBase } from 'vitepress'
import { useData } from '../composables/data'
import { isExternal, PATHNAME_PROTOCOL_RE } from '../../shared'

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
    // respect base url when using pathname:// protocal
    if (PATHNAME_PROTOCOL_RE.test(url)) {
      return withBase(url.replace(PATHNAME_PROTOCOL_RE, ''))
    }
    return url
  }

  const { site } = useData()
  const { pathname, search, hash } = new URL(url, 'http://a.com')

  const normalizedPath =
    pathname.endsWith('/') || pathname.endsWith('.html')
      ? url
      : url.replace(
          /(?:(^\.+)\/)?.*$/,
          `$1${pathname.replace(
            /(\.md)?$/,
            site.value.cleanUrls ? '' : '.html'
          )}${search}${hash}`
        )

  return withBase(normalizedPath)
}
