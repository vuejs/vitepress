import { useSiteData, Route } from 'vitepress'

export const hashRE = /#.*$/
export const extRE = /\.(md|html)$/
export const outboundRE = /^[a-z]+:/i

export function withBase(path: string) {
  return (useSiteData().value.base + path).replace(/\/+/g, '/')
}

export function isExternal(path: string): boolean {
  return outboundRE.test(path)
}

export function isActive(route: Route, path?: string): boolean {
  if (path === undefined) {
    return false
  }

  const routePath = normalize(route.path)
  const pagePath = normalize(path)

  return routePath === pagePath
}

export function normalize(path: string): string {
  return decodeURI(path).replace(hashRE, '').replace(extRE, '')
}

export function joinUrl(base: string, path: string): string {
  const baseEndsWithSlash = base.endsWith('/')
  const pathStartsWithSlash = path.startsWith('/')

  if (baseEndsWithSlash && pathStartsWithSlash) {
    return base.slice(0, -1) + path
  }

  if (!baseEndsWithSlash && !pathStartsWithSlash) {
    return `${base}/${path}`
  }

  return base + path
}

/**
 * get the path without filename (the last segment). for example, if the given
 * path is `/guide/getting-started.html`, this method will return `/guide/`.
 * Always with a trailing slash.
 */
export function getPathDirName(path: string): string {
  const segments = path.split('/')

  if (segments[segments.length - 1]) {
    segments.pop()
  }

  return ensureEndingSlash(segments.join('/'))
}

export function ensureEndingSlash(path: string): string {
  return /(\.html|\/)$/.test(path) ? path : `${path}/`
}
