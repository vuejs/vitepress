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
