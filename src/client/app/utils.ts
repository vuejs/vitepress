import { tryOnUnmounted } from '@vueuse/core'
import { h, onMounted, shallowRef, type AsyncComponentLoader } from 'vue'
import {
  EXTERNAL_URL_RE,
  inBrowser,
  type Awaitable,
  resolveChunkKeys
} from '../shared'
import { siteDataRef } from './data'

export { escapeHtml as _escapeHtml, inBrowser } from '../shared'

/**
 * Join two paths by resolving the slash collision.
 */
export function joinPath(base: string, path: string) {
  return `${base}${path}`.replace(/\/+/g, '/')
}

/**
 * Append base to internal (non-relative) urls
 */
export function withBase(path: string) {
  return EXTERNAL_URL_RE.test(path) || !path.startsWith('/')
    ? path
    : joinPath(siteDataRef.value.base, path)
}

export function pathToFile(path: string, suffix: string = '.js') {
  if (inBrowser) {
    if (import.meta.env.DEV) {
      // In dev server, always force re-fetch content
      path = path.replace(/\/$/, '/index').replace(/\.html$/i, '')
      return `${path}.md?t=${Date.now()}`
    } else {
      // in production, each .md file is built into [assetKey].[hash].js
      const base = import.meta.env.BASE_URL
      const { assetKey, hash } = resolveChunkKeys(path.slice(base.length), true)
      return `${base}${__ASSETS_DIR__}/${assetKey}.${hash}${suffix}`
    }
  } else {
    const { assetKey } = resolveChunkKeys(path, true)
    return `./${assetKey}${suffix}`
  }
}

export let contentUpdatedCallbacks: (() => any)[] = []

/**
 * Register callback that is called every time the markdown content is updated
 * in the DOM.
 */
export function onContentUpdated(fn: () => any) {
  contentUpdatedCallbacks.push(fn)
  tryOnUnmounted(() => {
    contentUpdatedCallbacks = contentUpdatedCallbacks.filter((f) => f !== fn)
  })
}

export function defineClientComponent(
  loader: AsyncComponentLoader,
  args?: any[],
  cb?: () => Awaitable<void>
) {
  return {
    setup() {
      const comp = shallowRef()
      onMounted(async () => {
        let res = await loader()
        // interop module default
        if (res && (res.__esModule || res[Symbol.toStringTag] === 'Module')) {
          res = res.default
        }
        comp.value = res
        await cb?.()
      })
      return () => (comp.value ? h(comp.value, ...(args ?? [])) : null)
    }
  }
}

export function getScrollOffset() {
  let scrollOffset = siteDataRef.value.scrollOffset
  let offset = 0
  let padding = 24
  if (typeof scrollOffset === 'object' && 'padding' in scrollOffset) {
    padding = scrollOffset.padding
    scrollOffset = scrollOffset.selector
  }
  if (typeof scrollOffset === 'number') {
    offset = scrollOffset
  } else if (typeof scrollOffset === 'string') {
    offset = tryOffsetSelector(scrollOffset, padding)
  } else if (Array.isArray(scrollOffset)) {
    for (const selector of scrollOffset) {
      const res = tryOffsetSelector(selector, padding)
      if (res) {
        offset = res
        break
      }
    }
  }

  return offset
}

function tryOffsetSelector(selector: string, padding: number): number {
  const el = document.querySelector(selector)
  if (!el) return 0
  const bot = el.getBoundingClientRect().bottom
  if (bot < 0) return 0
  return bot + padding
}
