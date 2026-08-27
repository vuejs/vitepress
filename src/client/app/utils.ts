import { tryOnUnmounted } from '@vueuse/core'
import { h, onMounted, shallowRef, type AsyncComponentLoader } from 'vue'

import {
  EXTERNAL_URL_RE,
  RELATIVE_BASE_SENTINEL,
  inBrowser,
  isRelativeBase,
  joinPath,
  sanitizeFileName,
  type Awaitable
} from '../shared'
import { siteDataRef } from './data'

export { escapeHtml as _escapeHtml, inBrowser } from '../shared'
export { joinPath } from '../shared'

let resolvedBase: string | undefined

/**
 * The base the site is actually served under. Equals the configured base,
 * except for a relative base ('./'), which cannot be known at build time:
 * there it is recovered from the per-page `__VP_SITE_ROOT__` inline script
 * in the browser, is '/' in dev (dev always serves at the root), and is the
 * build sentinel during SSR so rendered URLs can be relativized per page.
 */
export function runtimeBase(): string {
  if (resolvedBase === undefined) {
    const base = siteDataRef.value.base
    if (!isRelativeBase(base)) return (resolvedBase = base)
    if (!inBrowser) return (resolvedBase = RELATIVE_BASE_SENTINEL)
    if (import.meta.env.DEV) return (resolvedBase = '/')
    const root = (window as any).__VP_SITE_ROOT__
    resolvedBase = root
      ? decodeURIComponent(new URL(root, location.href).pathname)
      : '/'
  }
  return resolvedBase
}

/**
 * Prepend base to internal (non-relative) urls
 */
export function withBase(path: string) {
  return EXTERNAL_URL_RE.test(path) || !path.startsWith('/')
    ? path
    : joinPath(runtimeBase(), path)
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
      const base = runtimeBase()
      if (pagePath + '/' === base) pagePath = base
      if (!pagePath.startsWith(base)) return null
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
      pagePath = `${__ASSETS_BASE__ || base}${__ASSETS_DIR__}/${pagePath}.${pageHash}.js`
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
