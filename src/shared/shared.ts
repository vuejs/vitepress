import type {
  AdditionalConfig,
  HeadConfig,
  PageData,
  SiteData
} from '../../types/shared'

export type {
  AdditionalConfig,
  AdditionalConfigDict,
  AdditionalConfigLoader,
  Awaitable,
  CodeCopyButtonOptions,
  ContainerOptions,
  DefaultTheme,
  HeadConfig,
  Header,
  LocaleConfig,
  LocaleSpecificConfig,
  MarkdownEnv,
  MarkdownLocaleOptions,
  PageData,
  PageDataPayload,
  Route,
  SiteData,
  SSGContext,
  VitePressData
} from '../../types/shared'

export const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i
export const APPEARANCE_KEY = 'vitepress-theme-appearance'

/** collection bare icon names resolve in — the one vitepress ships itself */
export const DEFAULT_ICONS_COLLECTION = 'simple-icons'

// iconify's icon/collection name grammar
const iconNameRE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Parse `name` (resolved in [[DEFAULT_ICONS_COLLECTION]]) or
 * `collection:name` for any installed `@iconify-json/*` collection.
 * The corresponding class is `vpi-<collection>-<name>`. Returns null for
 * names that don't fit iconify's grammar (also keeping malformed input
 * out of generated selectors and class attributes).
 */
export function parseIconName(
  name: string
): { collection: string; icon: string } | null {
  const colon = name.indexOf(':')
  const collection =
    colon === -1 ? DEFAULT_ICONS_COLLECTION : name.slice(0, colon)
  const icon = colon === -1 ? name : name.slice(colon + 1)
  if (!iconNameRE.test(collection) || !iconNameRE.test(icon)) return null
  return { collection, icon }
}

/**
 * Placeholder base used by SSR when base is relative.
 * It is prepended to emitted URLs, then replaced with the ../ prefix
 * from each file back to the site root.
 */
export const RELATIVE_BASE_SENTINEL = '/__VP_BASE__/'

export function isRelativeBase(base: string): boolean {
  return base === './'
}

/**
 * The ../-prefix that leads from `relativePath`'s directory back to the
 * site root ('./' for root-level pages).
 */
export function relativePathToRoot(relativePath: string): string {
  const depth = relativePath.split('/').length - 1
  return depth ? '../'.repeat(depth) : './'
}

/**
 * Join two paths, collapsing slash collisions but keeping the `//` that
 * follows a protocol.
 */
export function joinPath(base: string, path: string): string {
  const protocol = /^(?:[a-z]+:)?\/\//i.exec(base)?.[0] ?? ''
  return protocol + `${base.slice(protocol.length)}${path}`.replace(/\/+/g, '/')
}

export const VP_SOURCE_KEY = '[VP_SOURCE]'
const UnpackStackView = Symbol('stack-view:unpack')

const HASH_WITHOUT_FRAGMENT_RE = /#.*?(?=:~:|$)/
const HASH_OR_QUERY_RE = /[?#].*$/
const INDEX_OR_EXT_RE = /(?:(^|\/)index)?(?:\.(?:md|html))?$/

// https://github.com/rollup/rollup/blob/fec513270c6ac350072425cc045db367656c623b/src/utils/sanitizeFileName.ts
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g
const DRIVE_LETTER_REGEX = /^[a-z]:/i

const KNOWN_EXTENSIONS = new Set()

const shellLangs = ['shellscript', 'shell', 'bash', 'sh', 'zsh']

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
  currentHash: string,
  matchPath: string,
  asRegex: boolean = false,
  skipHashCheck: boolean = false
): boolean {
  currentPath = normalize(`/${currentPath}`)

  if (asRegex) {
    return new RegExp(matchPath).test(currentPath)
  }

  if (normalize(matchPath) !== currentPath) {
    return false
  }

  if (skipHashCheck) {
    return true
  }

  const hashMatch = matchPath.match(HASH_WITHOUT_FRAGMENT_RE)

  if (hashMatch) {
    return currentHash === hashMatch[0]
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
        isActive(relativePath, '', `^/${key}/`, true)
    ) || 'root'
  )
}

/**
 * this merges the locales data to the main data by the route
 */
export function resolveSiteDataByRoute(
  siteData: SiteData,
  relativePath: string,
  filePath?: string
): SiteData {
  const localeIndex = getLocaleForPath(siteData, relativePath)
  const { label, link, markdown, ...localeConfig } =
    siteData.locales[localeIndex] ?? ({} as (typeof siteData.locales)[string])
  Object.assign(localeConfig, { localeIndex })

  // additional configs are colocated with sources, so resolve them by the
  // source path (filePath) rather than the rewritten one
  const additionalConfigs = resolveAdditionalConfig(
    siteData,
    filePath || relativePath
  )

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
  const keyMap = new Map<string, number>()

  for (const current of headArrays) {
    for (const tag of current) {
      const key = getHeadKey(tag)

      if (key == null) {
        merged.push(tag)
        continue
      }

      const existingIndex = keyMap.get(key)

      if (existingIndex != null) {
        merged[existingIndex] = tag // replace existing tag
      } else {
        keyMap.set(key, merged.length)
        merged.push(tag)
      }
    }
  }

  return merged
}

// any element is keyed by its `id`; a meta tag without one is keyed by its
// first attribute other than `content` (e.g. `name`, `property`, `http-equiv`)
function getHeadKey([type, attrs]: HeadConfig): string | undefined {
  if (attrs.id) return `id=${attrs.id}`
  if (type !== 'meta') return
  for (const name in attrs) {
    if (name !== 'content') return `${name}=${attrs[name]}`
  }
}

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

export function treatAsHtml(filename: string): boolean {
  if (KNOWN_EXTENSIONS.size === 0) {
    const extraExts =
      (globalThis as any).process?.env?.VITE_EXTRA_EXTENSIONS ||
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

  const configs: (AdditionalConfig | undefined)[] = []
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

export function isShell(lang: string): boolean {
  return shellLangs.includes(lang)
}
