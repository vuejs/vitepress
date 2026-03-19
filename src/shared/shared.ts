import type {
  AdditionalConfig,
  HeadConfig,
  PageData,
  SiteData
} from '../../types/shared'
import { sha256 } from '@noble/hashes/sha2.js'

export type {
  Awaitable,
  DefaultTheme,
  HeadConfig,
  Header,
  LocaleConfig,
  LocaleSpecificConfig,
  MarkdownEnv,
  PageData,
  PageDataPayload,
  SiteData,
  SSGContext,
  AdditionalConfig,
  AdditionalConfigDict,
  AdditionalConfigLoader
} from '../../types/shared'

export const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i
export const APPEARANCE_KEY = 'vitepress-theme-appearance'

export const VP_SOURCE_KEY = '[VP_SOURCE]'
const UnpackStackView = Symbol('stack-view:unpack')

const HASH_WITHOUT_FRAGMENT_RE = /#.*?(?=:~:|$)/
const HASH_OR_QUERY_RE = /[?#].*$/
const INDEX_OR_EXT_RE = /(?:(^|\/)index)?\.(?:md|html)$/

export const inBrowser = typeof document !== 'undefined'

export const notFoundPageData: PageData = {
  relativePath: '404.md',
  filePath: '',
  title: '404',
  description: 'Not Found',
  headers: [],
  frontmatter: { sidebar: false, layout: 'page' },
  lastUpdated: 0,
  isNotFound: true
}

export function isActive(
  currentPath: string,
  matchPath?: string,
  asRegex: boolean = false
): boolean {
  if (matchPath === undefined) {
    return false
  }

  currentPath = normalize(`/${currentPath}`)

  if (asRegex) {
    return new RegExp(matchPath).test(currentPath)
  }

  if (normalize(matchPath) !== currentPath) {
    return false
  }

  const hashMatch = matchPath.match(HASH_WITHOUT_FRAGMENT_RE)

  if (hashMatch) {
    return (inBrowser ? location.hash : '') === hashMatch[0]
  }

  return true
}

export function normalize(path: string): string {
  return decodeURI(path)
    .replace(HASH_OR_QUERY_RE, '')
    .replace(INDEX_OR_EXT_RE, '$1')
}

export function isExternal(path: string): boolean {
  return EXTERNAL_URL_RE.test(path)
}

export function getLocaleForPath(
  siteData: SiteData | undefined,
  relativePath: string
): string {
  return (
    Object.keys(siteData?.locales || {}).find(
      (key) =>
        key !== 'root' &&
        !isExternal(key) &&
        isActive(relativePath, `^/${key}/`, true)
    ) || 'root'
  )
}

/**
 * this merges the locales data to the main data by the route
 */
export function resolveSiteDataByRoute(
  siteData: SiteData,
  relativePath: string
): SiteData {
  const localeIndex = getLocaleForPath(siteData, relativePath)
  const { label, link, ...localeConfig } = siteData.locales[localeIndex] ?? {}
  Object.assign(localeConfig, { localeIndex })

  const additionalConfigs = resolveAdditionalConfig(siteData, relativePath)

  if (inBrowser && (import.meta as any).env?.DEV) {
    ;(localeConfig as any)[VP_SOURCE_KEY] = `locale config (${localeIndex})`
    reportConfigLayers(relativePath, [
      ...additionalConfigs,
      localeConfig,
      siteData
    ])
  }

  const topLayer = {
    head: mergeHead(
      siteData.head ?? [],
      localeConfig.head ?? [],
      ...additionalConfigs.map((data) => data.head ?? []).reverse()
    )
  } as SiteData

  return stackView<SiteData>(
    topLayer,
    ...additionalConfigs,
    localeConfig,
    siteData
  )
}

/**
 * Create the page title string based on config.
 */
export function createTitle(siteData: SiteData, pageData: PageData): string {
  const title = pageData.title || siteData.title
  const template = pageData.titleTemplate ?? siteData.titleTemplate

  if (typeof template === 'string' && template.includes(':title')) {
    return template.replace(/:title/g, title)
  }

  const templateString = createTitleTemplate(siteData.title, template)

  if (title === templateString.slice(3)) {
    return title
  }

  return `${title}${templateString}`
}

function createTitleTemplate(
  siteTitle: string,
  template?: string | boolean
): string {
  if (template === false) {
    return ''
  }

  if (template === true || template === undefined) {
    return ` | ${siteTitle}`
  }

  if (siteTitle === template) {
    return ''
  }

  return ` | ${template}`
}

export function mergeHead(...headArrays: HeadConfig[][]): HeadConfig[] {
  const merged: HeadConfig[] = []
  const metaKeyMap = new Map<string, number>()

  for (const current of headArrays) {
    for (const tag of current) {
      const [type, attrs] = tag
      const keyAttr = Object.entries(attrs)[0]

      if (type !== 'meta' || !keyAttr) {
        merged.push(tag)
        continue
      }

      const key = `${keyAttr[0]}=${keyAttr[1]}`
      const existingIndex = metaKeyMap.get(key)

      if (existingIndex != null) {
        merged[existingIndex] = tag // replace existing tag
      } else {
        metaKeyMap.set(key, merged.length)
        merged.push(tag)
      }
    }
  }

  return merged
}

// https://github.com/rollup/rollup/blob/fec513270c6ac350072425cc045db367656c623b/src/utils/sanitizeFileName.ts

const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g
const DRIVE_LETTER_REGEX = /^[a-z]:/i

export function sanitizeFileName(name: string): string {
  const match = DRIVE_LETTER_REGEX.exec(name)
  const driveLetter = match ? match[0] : ''

  return (
    driveLetter +
    name
      .slice(driveLetter.length)
      .replace(INVALID_CHAR_REGEX, '_')
      .replace(/(^|\/)_+(?=[^/]*$)/, '$1')
  )
}

export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

export function canonicalize(
  path: string,
  caseSensitive: boolean = false
): string {
  const normalizedPath = slash(path).replace(/\.(html|md)$/i, '')
  const segments = normalizedPath.split('/')
  const stack: string[] = []
  for (const segment of segments.filter((s) => s && s !== '.')) {
    if (segment === '..') {
      if (stack.length && stack[stack.length - 1] !== '..') stack.pop()
      else stack.push('..')
    } else {
      stack.push(segment)
    }
  }
  const canonical = stack.join('/')
  return caseSensitive ? canonical : canonical.toLowerCase()
}

/**
 * Create one-way mappings:
 *
 *   Canonical Path    ->      assetKey        ->          lookupKey
 *   (Maybe Private)        (Server Files)            (Shared with Client)
 *
 * -------------------------------------------------------------------------
 * Client must know the canonical path in order to resolve the valid chunk.
 * In case the site contains unlisted private pages or assets, client cannot
 * reverse map from lookupKey to assetKey or path name, avoiding unintentional
 * content leaks.
 * @param uid canonical path of the page, e.g. /foo/bar[.md|.html]
 */
export function hashKeys(uid: string): {
  lookupKey: string
  assetKey: string
} {
  // ensure leading slash for consistent hashing
  const input = new TextEncoder().encode(uid)
  const assetHash = sha256(input)
  const assetKey = [...assetHash.slice(0, 8)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const lookupBuffer = sha256(assetHash)
  const lookupKey = [...lookupBuffer.slice(0, 8)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return { lookupKey, assetKey }
}

declare const __VP_HASH_MAP__: Record<string, string>

export class ChunkNotFoundError extends Error {
  constructor(
    public readonly path: string,
    public readonly attempted: string[]
  ) {
    super(
      [
        `Cannot resolve chunk for ${JSON.stringify(path)}. Attempted:`,
        ...(attempted || ['(no candidates)'])
      ].join('\n - ')
    )
  }
}

export function resolveChunkKeys(
  path: string,
  caseSensitive: boolean = false,
  hashmap: Record<string, string> = __VP_HASH_MAP__
) {
  const isDir = path === '' || path.endsWith('/')
  if (isDir) path += 'index' // /foo/ -> /foo/index
  const normalized = canonicalize(path, caseSensitive)
  const candidates = [normalized]
  // Attempt /foo/index if /foo doesn't exist
  if (!isDir) candidates.push(normalized + '/index')
  const attempted: string[] = []
  for (const candidate of candidates) {
    attempted.push(candidate)
    const { lookupKey, assetKey } = hashKeys(candidate)
    // ssr build uses much simpler name mapping
    if (lookupKey in hashmap)
      return { assetKey, lookupKey, hash: hashmap[lookupKey] }
  }
  throw new ChunkNotFoundError(path, attempted)
}

const KNOWN_EXTENSIONS = new Set()

export function treatAsHtml(filename: string): boolean {
  if (KNOWN_EXTENSIONS.size === 0) {
    const extraExts =
      (typeof process === 'object' && process.env?.VITE_EXTRA_EXTENSIONS) ||
      (import.meta as any).env?.VITE_EXTRA_EXTENSIONS ||
      ''

    // md, html? are intentionally omitted
    ;(
      '3g2,3gp,aac,ai,apng,au,avif,bin,bmp,cer,class,conf,crl,css,csv,dll,' +
      'doc,eps,epub,exe,gif,gz,ics,ief,jar,jpe,jpeg,jpg,js,json,jsonld,m4a,' +
      'man,mid,midi,mjs,mov,mp2,mp3,mp4,mpe,mpeg,mpg,mpp,oga,ogg,ogv,ogx,' +
      'opus,otf,p10,p7c,p7m,p7s,pdf,png,ps,qt,roff,rtf,rtx,ser,svg,t,tif,' +
      'tiff,tr,ts,tsv,ttf,txt,vtt,wav,weba,webm,webp,woff,woff2,xhtml,xml,' +
      'yaml,yml,zip' +
      (extraExts && typeof extraExts === 'string' ? ',' + extraExts : '')
    )
      .split(',')
      .forEach((ext) => KNOWN_EXTENSIONS.add(ext))
  }

  const ext = filename.split('.').pop()

  return ext == null || !KNOWN_EXTENSIONS.has(ext.toLowerCase())
}

// https://github.com/sindresorhus/escape-string-regexp/blob/ba9a4473850cb367936417e97f1f2191b7cc67dd/index.js
export function escapeRegExp(str: string) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

/**
 * @internal
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/&(?![\w#]+;)/g, '&amp;')
}

function resolveAdditionalConfig(
  { additionalConfig }: SiteData,
  path: string
): AdditionalConfig[] {
  if (additionalConfig === undefined) return []
  if (typeof additionalConfig === 'function')
    return additionalConfig(path) ?? []

  const configs: AdditionalConfig[] = []
  const segments = path.split('/').slice(0, -1) // remove file name

  while (segments.length) {
    const key = `/${segments.join('/')}/`
    configs.push(additionalConfig[key])
    segments.pop()
  }

  configs.push(additionalConfig['/'])
  return configs.filter((config) => config !== undefined)
}

// This helps users to understand which configuration files are active
function reportConfigLayers(path: string, layers: Partial<SiteData>[]) {
  const summaryTitle = `Config Layers for ${path}:`

  const summary = layers.map((c, i, arr) => {
    const n = i + 1
    if (n === arr.length) return `${n}. .vitepress/config (root)`
    return `${n}. ${(c as any)?.[VP_SOURCE_KEY] ?? '(Unknown Source)'}`
  })

  console.debug(
    [summaryTitle, ''.padEnd(summaryTitle.length, '='), ...summary].join('\n')
  )
}

/**
 * Creates a deep, merged view of multiple objects without mutating originals.
 * Returns a readonly proxy behaving like a merged object of the input objects.
 * Layers are merged in descending precedence, i.e. earlier layer is on top.
 */
export function stackView<T extends ObjectType>(..._layers: Partial<T>[]): T {
  const layers = _layers.filter((layer) => isObject(layer))
  if (layers.length <= 1) return _layers[0] as T

  const allKeys = new Set(layers.flatMap((layer) => Reflect.ownKeys(layer)))
  const allKeysArray = [...allKeys]

  return new Proxy({} as T, {
    // TODO: optimize for performance, this is a hot path
    get(_, prop) {
      if (prop === UnpackStackView) return layers
      return stackView(
        ...layers
          .map((layer) => layer[prop])
          .filter((v): v is NonNullable<T[string | symbol]> => v !== undefined)
      )
    },
    set() {
      throw new Error('StackView is read-only and cannot be mutated.')
    },
    has(_, prop) {
      return allKeys.has(prop)
    },
    ownKeys() {
      return allKeysArray
    },
    getOwnPropertyDescriptor(_, prop) {
      for (const layer of layers) {
        const descriptor = Object.getOwnPropertyDescriptor(layer, prop)
        if (descriptor) return descriptor
      }
    }
  })
}

stackView.unpack = function <T>(obj: T): T[] | undefined {
  return (obj as any)?.[UnpackStackView]
}

type ObjectType = Record<PropertyKey, any>
export function isObject(value: unknown): value is ObjectType {
  return Object.prototype.toString.call(value) === '[object Object]'
}

const shellLangs = ['shellscript', 'shell', 'bash', 'sh', 'zsh']
export function isShell(lang: string): boolean {
  return shellLangs.includes(lang)
}
