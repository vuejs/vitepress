import { computed } from 'vue'
import { useRoute } from 'vitepress'
import type { DefaultTheme } from '../config'
import { isExternal as isExternalCheck } from '../utils'
import { useUrl } from '../composables/url'

export function useNavLink(item: DefaultTheme.NavItemWithLink) {
  const route = useRoute()
  const { withBase } = useUrl()

  const classes = computed(() => ({
    active: isActive.value,
    external: isExternal.value
  }))

  const isActive = computed(() => {
    return normalizePath(withBase(item.link)) === normalizePath(route.path)
  })

  const isExternal = computed(() => {
    return isExternalCheck(item.link)
  })

  const href = computed(() => {
    return isExternal.value ? item.link : withBase(item.link)
  })

  const target = computed(() => {
    if (item.target) {
      return item.target
    }

    return isExternal.value ? '_blank' : ''
  })

  const rel = computed(() => {
    if (item.rel) {
      return item.rel
    }

    return isExternal.value ? 'noopener noreferrer' : ''
  })

  const ariaLabel = computed(() => item.ariaLabel)

  const text = computed(() => item.text)

  return {
    classes,
    isActive,
    isExternal,
    href,
    target,
    rel,
    ariaLabel,
    text
  }
}

function normalizePath(path: string): string {
  path = path
    .replace(/#.*$/, '')
    .replace(/\?.*$/, '')
    .replace(/\.html$/, '')

  if (path.endsWith('/')) {
    path += 'index'
  }

  return path
}
