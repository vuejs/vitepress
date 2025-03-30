import {
  h,
  onMounted,
  onUnmounted,
  shallowRef,
  type AsyncComponentLoader
} from 'vue'
import {
  EXTERNAL_URL_RE,
  inBrowser,
  sanitizeFileName,
  type Awaitable
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

/**
 * Converts a url path to the corresponding js chunk filename.
 */
export function pathToFile(path: string) {
  let pagePath = path.replace(/\.html$/, '')
  pagePath = decodeURIComponent(pagePath)
  pagePath = pagePath.replace(/\/$/, '/index') // /foo/ -> /foo/index
  if (import.meta.env.DEV) {
    // always force re-fetch content in dev
    pagePath += `.md?t=${Date.now()}`
  } else {
    // in production, each .md file is built into a .md.js file following
    // the path conversion scheme.
    // /foo/bar.html -> ./foo_bar.md
    if (inBrowser) {
      const base = import.meta.env.BASE_URL
      pagePath =
        sanitizeFileName(
          pagePath.slice(base.length).replace(/\//g, '_') || 'index'
        ) + '.md'
      // client production build needs to account for page hash, which is
      // injected directly in the page's html
      let pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()]
      if (!pageHash) {
        pagePath = pagePath.endsWith('_index.md')
          ? pagePath.slice(0, -9) + '.md'
          : pagePath.slice(0, -3) + '_index.md'
        pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()]
      }
      if (!pageHash) return null
      pagePath = `${base}${__ASSETS_DIR__}/${pagePath}.${pageHash}.js`
    } else {
      // ssr build uses much simpler name mapping
      pagePath = `./${sanitizeFileName(
        pagePath.slice(1).replace(/\//g, '_')
      )}.md.js`
    }
  }

  return pagePath
}

export let contentUpdatedCallbacks: (() => any)[] = []

/**
 * Register callback that is called every time the markdown content is updated
 * in the DOM.
 */
export function onContentUpdated(fn: () => any) {
  contentUpdatedCallbacks.push(fn)
  onUnmounted(() => {
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

export function dirname(path: string) {
  const segments = path.split('/')
  segments[segments.length - 1] = ''
  return segments.join('/')
}

const unpackStackView = Symbol('unpackStackView')

function isStackable(obj: any) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}
/**
 * Creates a deep, merged view of multiple objects without mutating originals.
 * Returns a readonly proxy behaving like a merged object of the input objects.
 * Layers are merged in descending precedence, i.e. earlier layer is on top.
 */
export function stackView<T extends object>(...layers: T[]): T {
  layers = layers.filter((layer) => layer !== undefined)
  if (layers.length == 0) return undefined as any as T
  if (layers.length == 1 || !isStackable(layers[0])) return layers[0]
  layers = layers.filter(isStackable)
  if (layers.length == 1) return layers[0]
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (prop === unpackStackView) {
          return layers
        }
        return stackView(...layers.map((layer) => (layer as any)?.[prop]))
      },
      set(target, prop, value) {
        throw new Error('StackView is read-only and cannot be mutated.')
      },
      has(target, prop) {
        for (const layer of layers) {
          if (prop in layer) return true
        }
        return false
      },
      ownKeys(target) {
        const keys = new Set<string>()
        for (const layer of layers) {
          for (const key of Object.keys(layer)) {
            keys.add(key)
          }
        }
        return Array.from(keys)
      },
      getOwnPropertyDescriptor(target, prop) {
        for (const layer of layers) {
          if (prop in layer) {
            return Object.getOwnPropertyDescriptor(layer, prop)
          }
        }
      }
    }
  ) as T
}

stackView.unpack = (obj: any) => obj?.[unpackStackView]
