import { computed } from 'vue'
import { useRoute } from 'vitepress'
import type { DefaultTheme } from '../config'
import { isExternal as isExternalCheck } from '../utils'
import { useUrl } from '../composables/url'

export function useNavLink(item: DefaultTheme.NavItemWithLink) {
  const route = useRoute()
  const { withBase } = useUrl()

  const isExternal = isExternalCheck(item.link)

  const props = computed(() => {
    return {
      class: {
        active: normalizePath(route.path).startsWith(
          normalizePath(withBase(item.link))
        ),
        isExternal
      },
      href: isExternal ? item.link : withBase(item.link),
      target: item.target || isExternal ? `_blank` : null,
      rel: item.rel || isExternal ? `noopener noreferrer` : null,
      'aria-label': item.ariaLabel
    }
  })

  return {
    props,
    isExternal
  }
}

function normalizePath(path: string): string {
  return path
    .replace(/#.*$/, '')
    .replace(/\?.*$/, '')
    .replace(/\.(html|md)$/, '')
}
