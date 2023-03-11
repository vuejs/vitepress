import { siteDataRef } from './data.js'
import { inBrowser, EXTERNAL_URL_RE, sanitizeFileName } from '../shared.js'
import { onUnmounted } from 'vue'

export { inBrowser } from '../shared.js'

/**
 * Join two paths by resolving the slash collision.
 */
export function joinPath(base: string, path: string): string {
  return `${base}${path}`.replace(/\/+/g, '/')
}

export function withBase(path: string) {
  return EXTERNAL_URL_RE.test(path) || path.startsWith('.')
    ? path
    : joinPath(siteDataRef.value.base, path)
}

/**
 * Converts a url path to the corresponding js chunk filename.
 */
export function pathToFile(path: string): string {
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
      pagePath = `${base}assets/${pagePath}.${pageHash}.js`
    } else {
      // ssr build uses much simpler name mapping
      pagePath = `./${sanitizeFileName(
        pagePath.slice(1).replace(/\//g, '_')
      )}.md.js`
    }
  }

  return pagePath
}

export function deserializeFunctions(value: any): any {
  if (Array.isArray(value)) {
    return value.map(deserializeFunctions)
  } else if (typeof value === 'object' && value !== null) {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = deserializeFunctions(value[key])
      return acc
    }, {} as any)
  } else if (typeof value === 'string' && value.startsWith('_vp-fn_')) {
    return new Function(`return ${value.slice(7)}`)()
  } else {
    return value
  }
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
