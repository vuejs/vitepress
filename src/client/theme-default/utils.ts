import { useSiteData } from 'vitepress'

export function withBase(path: string) {
  return (useSiteData().value.base + path).replace(/\/+/g, '/')
}
