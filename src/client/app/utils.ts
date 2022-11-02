import quantize from 'quantize'
import { siteDataRef } from './data.js'
import { inBrowser, EXTERNAL_URL_RE, sanitizeFileName } from '../shared.js'

export { inBrowser }

/**
 * Join two paths by resolving the slash collision.
 */
export function joinPath(base: string, path: string): string {
  return `${base}${path}`.replace(/\/+/g, '/')
}

export function withBase(path: string) {
  return EXTERNAL_URL_RE.test(path)
    ? path
    : joinPath(siteDataRef.value.base, path)
}

/**
 * Converts a url path to the corresponding js chunk filename.
 */
export function pathToFile(path: string): string {
  let pagePath = path.replace(/\.html$/, '')
  pagePath = decodeURIComponent(pagePath)
  if (pagePath.endsWith('/')) {
    pagePath += 'index'
  }

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
      const pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()]
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

export const getColors = (img: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const { naturalWidth, naturalHeight } = img
  canvas.width = naturalWidth
  canvas.height = naturalHeight
  ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight)
  const imageData = ctx.getImageData(0, 0, naturalWidth, naturalHeight)
  const pixels = imageData.data
  const pixelCount = naturalWidth * naturalHeight

  const pixelArray: number[][] = []
  for (let i = 0; i < pixelCount; i = i + 10) {
    const offset = i * 4;
    const r = pixels[offset + 0]
    const g = pixels[offset + 1]
    const b = pixels[offset + 2]
    const a = pixels[offset + 3]

    // If pixel is mostly opaque and not white
    if (typeof a === 'undefined' || a >= 125) {
      if (!(r > 250 && g > 250 && b > 250)) {
        pixelArray.push([r, g, b])
      }
    }
  }

  const cmap = quantize(pixelArray, 10)
  return cmap ? cmap.palette() : null
}
