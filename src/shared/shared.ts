import type { HeadConfig, PageData, SiteData } from '../../types/shared'

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
  SSGContext,
  SiteData
} from '../../types/shared'

export const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i
export const APPEARANCE_KEY = 'vitepress-theme-appearance'
export const HASH_RE = /#.*$/
export const EXT_RE = /(index)?\.(md|html)$/

export const inBrowser = typeof document !== 'undefined'

export const notFoundPageData: PageData = {
  relativePath: '',
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

  const hashMatch = matchPath.match(HASH_RE)

  if (hashMatch) {
    return (inBrowser ? location.hash : '') === hashMatch[0]
  }

  return true
}

export function normalize(path: string): string {
  return decodeURI(path).replace(HASH_RE, '').replace(EXT_RE, '')
}

export function isExternal(path: string): boolean {
  return EXTERNAL_URL_RE.test(path)
}

/**
 * this merges the locales data to the main data by the route
 */
export function resolveSiteDataByRoute(
  siteData: SiteData,
  relativePath: string
): SiteData {
  const localeIndex =
    Object.keys(siteData.locales).find(
      (key) =>
        key !== 'root' &&
        !isExternal(key) &&
        isActive(relativePath, `/${key}/`, true)
    ) || 'root'

  return Object.assign({}, siteData, {
    localeIndex,
    lang: siteData.locales[localeIndex]?.lang ?? siteData.lang,
    dir: siteData.locales[localeIndex]?.dir ?? siteData.dir,
    title: siteData.locales[localeIndex]?.title ?? siteData.title,
    titleTemplate:
      siteData.locales[localeIndex]?.titleTemplate ?? siteData.titleTemplate,
    description:
      siteData.locales[localeIndex]?.description ?? siteData.description,
    head: mergeHead(siteData.head, siteData.locales[localeIndex]?.head ?? []),
    themeConfig: {
      ...siteData.themeConfig,
      ...siteData.locales[localeIndex]?.themeConfig
    }
  })
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

function hasTag(head: HeadConfig[], tag: HeadConfig) {
  const [tagType, tagAttrs] = tag
  if (tagType !== 'meta') return false
  const keyAttr = Object.entries(tagAttrs)[0] // First key
  if (keyAttr == null) return false
  return head.some(
    ([type, attrs]) => type === tagType && attrs[keyAttr[0]] === keyAttr[1]
  )
}

export function mergeHead(prev: HeadConfig[], curr: HeadConfig[]) {
  return [...prev.filter((tagAttrs) => !hasTag(curr, tagAttrs)), ...curr]
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

// adapted from https://stackoverflow.com/a/46432113/11613622

export class LRUCache<K, V> {
  private max: number
  private cache: Map<K, V>

  constructor(max: number = 10) {
    this.max = max
    this.cache = new Map<K, V>()
  }

  get(key: K): V | undefined {
    let item = this.cache.get(key)
    if (item !== undefined) {
      // refresh key
      this.cache.delete(key)
      this.cache.set(key, item)
    }
    return item
  }

  set(key: K, val: V): void {
    // refresh key
    if (this.cache.has(key)) this.cache.delete(key)
    // evict oldest
    else if (this.cache.size === this.max) this.cache.delete(this.first()!)
    this.cache.set(key, val)
  }

  first(): K | undefined {
    return this.cache.keys().next().value
  }

  find(fn: (v: V, k: K, self: LRUCache<K, V>) => boolean): V | undefined {
    for (const [key, value] of this.cache.entries()) {
      if (fn(value, key, this)) {
        return value
      }
    }
    return undefined
  }

  delete(key: K): boolean {
    if (this.cache.has(key)) {
      const deleted = this.cache.delete(key)
      return deleted
    }
    return false
  }

  clear(): void {
    this.cache.clear()
  }
}
