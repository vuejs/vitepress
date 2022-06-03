import { ref } from 'vue'
import { withBase } from 'vitepress'

export const HASH_RE = /#.*$/
export const EXT_RE = /(index)?\.(md|html)$/
export const OUTBOUND_RE = /^[a-z]+:/i

const inBrowser = typeof window !== 'undefined'
const hashRef = ref(inBrowser ? location.hash : '')

export function isExternal(path: string): boolean {
  return OUTBOUND_RE.test(path)
}

export function throttleAndDebounce(fn: () => void, delay: number): () => void {
  let timeout: number
  let called = false

  return () => {
    if (timeout) {
      clearTimeout(timeout)
    }

    if (!called) {
      fn()
      called = true
      setTimeout(() => {
        called = false
      }, delay)
    } else {
      timeout = setTimeout(fn, delay)
    }
  }
}

export function isActive(
  currentPath: string,
  matchPath?: string,
  asRegex: boolean = false
): boolean {
  if (matchPath === undefined) {
    return false
  }

  currentPath = normalize(`/${currentPath}`)

  if (asRegex) {
    return new RegExp(matchPath).test(currentPath)
  }

  if (normalize(matchPath) !== currentPath) {
    return false
  }

  const hashMatch = matchPath.match(HASH_RE)

  if (hashMatch) {
    return hashRef.value === hashMatch[0]
  }

  return true
}

export function ensureStartingSlash(path: string): string {
  return /^\//.test(path) ? path : `/${path}`
}

export function normalize(path: string): string {
  return decodeURI(path).replace(HASH_RE, '').replace(EXT_RE, '')
}

export function normalizeLink(url: string): string {
  if (isExternal(url)) {
    return url
  }

  const { pathname, search, hash } = new URL(url, 'http://example.com')

  const normalizedPath =
    pathname.endsWith('/') || pathname.endsWith('.html')
      ? url
      : `${pathname.replace(/(\.md)?$/, '.html')}${search}${hash}`

  return withBase(normalizedPath)
}
