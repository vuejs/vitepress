import { useSiteData } from 'vitepress'
import { joinPath } from '/@app/utils'

export function useUrl() {
  const site = useSiteData()

  function withBase(path: string): string {
    return joinPath(site.value.base, path)
  }

  return {
    withBase
  }
}
