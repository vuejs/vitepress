// markdown-it plugin rendering ```mermaid code blocks to SVG at build time
// with pele (https://pele.run), so pages ship diagrams instead of a
// renderer. Diagrams are themed through CSS variables on `.vp-mermaid`, and
// the client only adds zoom and pan (src/client/app/composables/mermaidZoom.ts).

import { createRequire } from 'node:module'
import path from 'node:path'

import { getIconData, iconToSVG } from '@iconify/utils'
import type { MarkdownItAsync } from 'markdown-it-async'
import type { IconResolver, RenderOptions, TextMeasurer } from 'pele'
import c from 'picocolors'
import type { Logger } from 'vite'

import {
  parseIconName,
  type MarkdownEnv,
  type MarkdownLocaleOptions,
  type MermaidLocaleOptions
} from '../../shared'
import { INTER_BOLD, INTER_REGULAR } from './mermaidMetrics'

type Pele = typeof import('pele')

export interface MermaidZoomOptions {
  /**
   * Whether a diagram that fits its container can be enlarged as well. By
   * default only a diagram that was shrunk to fit can be.
   * @default false
   */
  always?: boolean
  /**
   * The most a diagram is enlarged, as a multiple of its natural size.
   * @default 3
   */
  maxScale?: number
}

export interface MermaidOptions
  extends Omit<RenderOptions, 'idPrefix'>, MermaidLocaleOptions {
  /**
   * What to do with a diagram that cannot be rendered. `'render'` (the
   * default) renders the error message and the diagram source in place of
   * the diagram and logs a warning; `'throw'` fails the page render (and
   * the build) instead.
   * @default 'render'
   */
  onError?: 'render' | 'throw'
  /**
   * Zoom and pan of diagrams in the browser. `'auto'` (the default) enables
   * it for diagrams that were shrunk to fit their container, `true` for all
   * diagrams, and `false` for none. Pass an object for finer control.
   * @default 'auto'
   */
  zoom?: boolean | 'auto' | MermaidZoomOptions
}

export interface MermaidPluginOptions {
  /**
   * Per-locale overrides for the labels, keyed by locale index.
   */
  locales?: Record<string, MarkdownLocaleOptions | undefined>
  logger?: Pick<Logger, 'warn'>
  /**
   * The directory icon collections (`@iconify-json/*`) are resolved from.
   */
  root: string
}

const DEFAULT_LABELS: Required<MermaidLocaleOptions> = {
  zoomInLabel: 'Zoom in',
  zoomOutLabel: 'Zoom out',
  resetZoomLabel: 'Reset zoom',
  errorLabel: 'Unable to render diagram'
}

// the default theme's font - labels are measured with its metrics too
const DEFAULT_FONT_FAMILY = 'Inter, sans-serif'

// lucide icons (ISC) - plus, minus, rotate-ccw
const CONTROLS = [
  ['zoom-in', 'zoomInLabel', 'M5 12h14M12 5v14'],
  ['zoom-out', 'zoomOutLabel', 'M5 12h14'],
  [
    'zoom-reset',
    'resetZoomLabel',
    'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5'
  ]
] as const

export function mermaidPlugin(
  md: MarkdownItAsync,
  pele: Pele,
  options: MermaidOptions = {},
  { locales, logger = console, root }: MermaidPluginOptions
) {
  const {
    onError = 'render',
    zoom = 'auto',
    zoomInLabel,
    zoomOutLabel,
    resetZoomLabel,
    errorLabel,
    ...renderOptions
  } = options
  const { escapeHtml } = md.utils

  const baseLabels: Required<MermaidLocaleOptions> = {
    zoomInLabel: zoomInLabel || DEFAULT_LABELS.zoomInLabel,
    zoomOutLabel: zoomOutLabel || DEFAULT_LABELS.zoomOutLabel,
    resetZoomLabel: resetZoomLabel || DEFAULT_LABELS.resetZoomLabel,
    errorLabel: errorLabel || DEFAULT_LABELS.errorLabel
  }
  const labelsFor = (localeIndex?: string): Required<MermaidLocaleOptions> => {
    const locale = localeIndex ? locales?.[localeIndex]?.mermaid : undefined
    return locale ? { ...baseLabels, ...stripEmpty(locale) } : baseLabels
  }

  const fontFamily = renderOptions.fontFamily ?? DEFAULT_FONT_FAMILY
  const measurer = renderOptions.measurer ?? measurerFor(fontFamily)
  const warn = (message: string) => logger.warn(c.yellow(`\n${message}`))
  const icons = renderOptions.icons ?? createIconResolver(root, warn)

  const zoomAttrs =
    zoom === false
      ? ''
      : ` data-zoom="${zoom === true || (typeof zoom === 'object' && zoom.always) ? 'always' : 'auto'}"` +
        (typeof zoom === 'object' && zoom.maxScale
          ? ` data-zoom-max="${+zoom.maxScale}"`
          : '')

  const controlsHtml = (labels: Required<MermaidLocaleOptions>) =>
    zoom === false
      ? ''
      : `<div class="vp-mermaid-controls" hidden>` +
        CONTROLS.map(([cls, label, d]) => {
          const text = escapeHtml(labels[label])
          return (
            `<button type="button" class="${cls}" title="${text}" aria-label="${text}">` +
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>` +
            `</button>`
          )
        }).join('') +
        `</div>`

  // one counter per render, so accessibility ids stay unique within a page
  const counters = new WeakMap<object, number>()
  const noEnv = {}

  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx, , env] = args
    const token = tokens[idx]
    if (extractLang(token.info) !== 'mermaid') return fence(...args)

    const { localeIndex, relativePath } = (env ?? {}) as MarkdownEnv
    const labels = labelsFor(localeIndex)
    const key = typeof env === 'object' && env !== null ? env : noEnv
    const count = (counters.get(key) ?? 0) + 1
    counters.set(key, count)

    try {
      const { svg, type } = pele.render(token.content, {
        ...renderOptions,
        fontFamily,
        measurer,
        icons,
        idPrefix: `vp-mermaid-${count}`
      })
      return (
        `<div class="vp-mermaid" data-type="${type}"${zoomAttrs} v-pre>` +
        svg +
        controlsHtml(labels) +
        `</div>\n`
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const where = relativePath ? `${relativePath}: ` : ''
      if (onError === 'throw') {
        throw new Error(
          `${where}mermaid diagram could not be rendered.\n${message}`,
          { cause: error }
        )
      }
      warn(`${where}mermaid diagram could not be rendered.\n${message}`)
      // the source is shown as a code block in its place
      return (
        `<div class="vp-mermaid vp-mermaid-error">` +
        `<div class="vp-mermaid-error-message">` +
        `<p class="vp-mermaid-error-title">${escapeHtml(labels.errorLabel)}</p>` +
        `<pre v-pre>${escapeHtml(message)}</pre>` +
        `</div>` +
        fence(...args) +
        `</div>\n`
      )
    }
  }
}

// keep in sync with ./preWrapper.ts#extractLang - `mermaid-vue` is not a
// diagram, as its Vue interpolations only resolve in the browser
function extractLang(info: string): string {
  return /^[a-zA-Z0-9-_]+/.exec(info)?.[0].toLowerCase() ?? ''
}

function stripEmpty<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v)
  ) as Partial<T>
}

/* ==================== Text measurement ==================== */

// pele's own width table is Arial's. Labels set in Inter are laid out with
// Inter's widths; other fonts fall back to pele's table, which over-estimates
// the common system fonts and so keeps labels inside their nodes.
function measurerFor(fontFamily: string): TextMeasurer | undefined {
  const first = fontFamily
    .split(',')[0]
    .trim()
    .replace(/^(['"])(.*)\1$/, '$2')
  return /^inter\b/i.test(first) ? interMeasurer : undefined
}

// pele's style flags
const BOLD = 1
const MONO = 4

function unpack(packed: string): Uint16Array {
  const out = new Uint16Array(95)
  for (let i = 0; i < 95; i++) out[i] = parseInt(packed.substr(i * 2, 2), 36)
  return out
}

let regular: Uint16Array | undefined
let bold: Uint16Array | undefined

function isWide(c: number): boolean {
  return (
    (c >= 0x1100 && c <= 0x115f) ||
    (c >= 0x2e80 && c <= 0xa4cf) ||
    (c >= 0xac00 && c <= 0xd7a3) ||
    (c >= 0xf900 && c <= 0xfaff) ||
    (c >= 0xfe30 && c <= 0xfe4f) ||
    (c >= 0xff00 && c <= 0xff60) ||
    (c >= 0xffe0 && c <= 0xffe6) ||
    (c >= 0xd800 && c <= 0xdbff)
  )
}

function isZeroWidth(c: number): boolean {
  return (
    (c >= 0x300 && c <= 0x36f) ||
    (c >= 0x200b && c <= 0x200f) ||
    (c >= 0xdc00 && c <= 0xdfff) ||
    (c >= 0xfe00 && c <= 0xfe0f) ||
    c === 0xfeff
  )
}

// mirrors pele's table measurer, with Inter's widths - non-ASCII characters
// are estimated as pele does
const interMeasurer: TextMeasurer = {
  width(text, size, style) {
    const mono = (style & MONO) !== 0
    const table =
      style & BOLD
        ? (bold ??= unpack(INTER_BOLD))
        : (regular ??= unpack(INTER_REGULAR))
    let units = 0
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i)
      if (c < 32) continue
      if (c < 127) units += mono ? 600 : table[c - 32]
      else if (isZeroWidth(c)) continue
      else if (isWide(c)) units += mono ? 1200 : 1000
      else units += mono ? 600 : 580
    }
    return (units * size) / 1000
  }
}

/* ==================== Icons ==================== */

// mermaid's font awesome shorthands, mapped to their iconify collections
const FA_COLLECTIONS: Record<string, string> = {
  fa: 'fa6-solid',
  fas: 'fa6-solid',
  far: 'fa6-regular',
  fab: 'fa6-brands'
}

type IconifyJSON = Parameters<typeof getIconData>[0]

// vitepress's own collections, resolvable even when the project doesn't
// install them (see ../../icons.ts)
const ownRequire = createRequire(import.meta.url)

/**
 * Resolves the icons diagrams name (`fa:fa-car` in labels, `logos:aws` in
 * architecture diagrams) from the iconify collections installed in the
 * project, as the rest of VitePress's icon support does.
 */
export function createIconResolver(
  root: string,
  warn: (message: string) => void = console.warn
): IconResolver {
  const projectRequire = createRequire(path.resolve(root, 'noop.js'))
  const collections = new Map<string, IconifyJSON | undefined>()
  const resolved = new Map<string, string | null>()
  const warned = new Set<string>()
  const warnOnce = (message: string) => {
    if (warned.has(message)) return
    warned.add(message)
    warn(message)
  }

  const load = (collection: string): IconifyJSON | undefined => {
    let data = collections.get(collection)
    if (data === undefined) {
      for (const require of [projectRequire, ownRequire]) {
        try {
          data = require(`@iconify-json/${collection}/icons.json`)
          break
        } catch {}
      }
      // misses aren't cached, so a collection installed during dev is found
      if (data) collections.set(collection, data)
    }
    return data
  }

  return (raw) => {
    let markup = resolved.get(raw)
    if (markup !== undefined) return markup

    markup = null
    const parsed = parseName(raw)
    if (parsed) {
      const { collection, icon } = parsed
      const data = load(collection)
      if (!data) {
        warnOnce(
          `icon collection "${collection}" (needed by "${raw}" in a mermaid ` +
            `diagram) is not installed - run \`npm add -D @iconify-json/${collection}\` ` +
            `in your project`
        )
      } else {
        const iconData = getIconData(data, icon)
        if (!iconData) {
          warnOnce(
            `icon "${icon}" (from "${raw}" in a mermaid diagram) was not found ` +
              `in the "${collection}" collection - check ` +
              `https://icones.js.org/collection/${collection} for valid names.`
          )
        } else {
          const { attributes, body } = iconToSVG(iconData)
          // pele draws its slot as a 24-unit stroked grid; the icon brings its
          // own coordinates and fills, so neither leaks into the other
          markup = `<svg viewBox="${attributes.viewBox}" width="24" height="24" fill="currentColor" stroke="none">${body}</svg>`
        }
      }
    }
    if (markup !== null || parsed) resolved.set(raw, markup)
    return markup
  }
}

function parseName(raw: string): { collection: string; icon: string } | null {
  const colon = raw.indexOf(':')
  if (colon === -1) return null
  let collection = raw.slice(0, colon)
  let icon = raw.slice(colon + 1)
  const fa = FA_COLLECTIONS[collection]
  if (fa) {
    collection = fa
    icon = icon.replace(/^fa-/, '')
  }
  return parseIconName(`${collection}:${icon}`)
}
