import { resolveTitleFromToken } from '@mdit-vue/shared'
import { isHTMLTag, isMathMLTag, isSVGTag } from '@vue/shared'
import { LRUCache } from 'lru-cache'
import fs from 'node:fs'
import path from 'node:path'
import { createDebug } from 'obug'
import { createFilter, type Plugin } from 'vite'
import { DEFAULT_THEME_PATH } from './alias'
import type { SiteConfig } from './config'
import {
  createMarkdownRenderer,
  mergeMarkdownLocales,
  type MarkdownOptions,
  type MarkdownRenderer
} from './markdown/markdown'
import { getPageDataTransformer } from './plugins/dynamicRoutesPlugin'
import {
  EXTERNAL_URL_RE,
  getLocaleForPath,
  slash,
  treatAsHtml,
  type HeadConfig,
  type MarkdownEnv,
  type PageData
} from './shared'
import { getGitTimestamp } from './utils/getGitTimestamp'
import { processIncludes } from './utils/processIncludes'

const debug = createDebug('vitepress:md')
const MARKDOWN_CACHE_MAX_BYTES = 32 * 1024 * 1024
const cache = new LRUCache<string, MarkdownCompileResult>({
  maxSize: MARKDOWN_CACHE_MAX_BYTES,
  sizeCalculation(result) {
    return (
      Buffer.byteLength(result.vueSrc) +
      Buffer.byteLength(result.html) +
      (result.markdownSource ? Buffer.byteLength(result.markdownSource) : 0) +
      // Limit the cache when page data or link arrays are large. Do not
      // serialize these objects a second time.
      1024
    )
  }
})
const deadLinkPageCache = new WeakMap<
  SiteConfig,
  { source: string[]; pages: Set<string> }
>()

const scriptRE = /<\/script>/
const scriptLangTsRE = /<\s*script[^>]*\blang=['"]ts['"][^>]*/
const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*/
const scriptClientRE = /<\s*script[^>]*\bclient\b[^>]*/
const defaultExportRE = /((?:^|\n|;)\s*)export(\s*)default/
const namedDefaultExportRE = /((?:^|\n|;)\s*)export(.+)as(\s*)default/
const SSR_PAGE_ARTIFACT_SUFFIX = '.__vitepress_ssr.vue'

let __dynamicRoutes = new Map<string, [string, string]>()
let __rewrites = new Map<string, string>()
let __ts: number

export interface MarkdownCompileResult {
  vueSrc: string
  /** Rendered Markdown body before Vue's SFC compiler processes it. */
  html: string
  /** Markdown after include/snippet expansion, reusable by local search. */
  markdownSource?: string
  /**
   * Snapshot of the documented Markdown environment from the first render.
   * Store a plain copy so private or cyclic plugin data does not enter the
   * persistent artifact.
   */
  markdownEnv?: MarkdownEnv
  pageData: PageData
  deadLinks: { url: string; file: string; line?: number }[]
  /** Raw link facts used to revalidate routes/public files every build. */
  linkCandidates?: PageLinkCandidate[]
  linkContext?: PageLinkContext
  includes: string[]
  /**
   * Set when the page can render without a Vue module. Omit `staticHtml` when
   * `html` is ready for SSR.
   */
  staticPage?: true
  /** SSR-ready static HTML with compile-time-only `v-pre` markers removed. */
  staticHtml?: string
  /**
   * Marks a cached module refresh after page-data hooks. Do not rewrite user
   * default exports as component names.
   */
  generatedPageComponentName?: true
  /**
   * User SFC blocks can expose the component ID and importer ID. Compile these
   * pages with the physical Markdown ID. Client and SSR transforms then see
   * the same file name.
   */
  requiresSourceModuleIdentity?: true
}

export interface PageLinkCandidate {
  url: string
  line?: number
}

export interface PageLinkContext {
  /** Original source/template path used in diagnostics. */
  file: string
  /** Rewritten absolute page path used to resolve relative links. */
  pagePath: string
}

export interface MarkdownToVueRenderFn {
  (src: string, file: string): Promise<MarkdownCompileResult>
  /** Apply site and dynamic-route page-data hooks without rerendering Markdown. */
  finalize(
    artifact: MarkdownCompileResult,
    file: string
  ): Promise<MarkdownCompileResult>
}

export function clearCache(relativePath?: string) {
  if (!relativePath) {
    cache.clear()
    return
  }

  relativePath = JSON.stringify({ relativePath }).slice(1)
  cache.find((_, key) => key.endsWith(relativePath!) && cache.delete(key))
}

function normalizeDriveLetter(file: string) {
  return file.replace(/^[a-z]:/i, (drive) => drive.toLowerCase())
}

function getResolutionCache(siteConfig: SiteConfig) {
  // @ts-expect-error internal
  if (siteConfig.__dirty) {
    __dynamicRoutes = new Map(
      siteConfig.dynamicRoutes.map((r) => [
        r.fullPath,
        [slash(path.join(siteConfig.srcDir, r.route)), r.loaderPath]
      ])
    )

    __rewrites = new Map(
      Object.entries(siteConfig.rewrites.map).map(([key, value]) => [
        normalizeDriveLetter(slash(path.join(siteConfig.srcDir, key))),
        normalizeDriveLetter(slash(path.join(siteConfig.srcDir, value!)))
      ])
    )

    __ts = Date.now()

    // @ts-expect-error internal
    siteConfig.__dirty = false
  }

  return {
    dynamicRoutes: __dynamicRoutes,
    rewrites: __rewrites,
    ts: __ts
  }
}

export async function createMarkdownToVueRenderFn(
  srcDir: string,
  options: MarkdownOptions,
  base: string,
  includeLastUpdatedData: boolean,
  cleanUrls: boolean,
  siteConfig: SiteConfig,
  initializeRenderer = false,
  validateLinks = true,
  deferPageDataTransforms = false,
  artifactPlugins: unknown = siteConfig.vite?.plugins,
  renderBuiltUrl: unknown = siteConfig.vite?.experimental?.renderBuiltUrl
) {
  const localSearchOptions = (
    siteConfig.site.themeConfig as
      | {
          search?: {
            options?: { _render?: unknown; _transformHtml?: unknown }
          }
        }
      | undefined
  )?.search?.options
  const captureSearchEnv =
    typeof localSearchOptions?._transformHtml === 'function'
  const captureSearchSource =
    !captureSearchEnv && typeof localSearchOptions?._render === 'function'
  let mdPromise: Promise<MarkdownRenderer> | undefined
  const getMarkdownRenderer = () =>
    (mdPromise ??= createMarkdownRenderer(
      srcDir,
      mergeMarkdownLocales(options, siteConfig?.site.locales),
      base,
      siteConfig?.logger,
      siteConfig?.publicDir,
      siteConfig?.cacheDir
    ))

  // The artifact seed runs renderer setup hooks once per build. It also runs
  // them when all pages come from the cache. Later environments remain lazy.
  if (initializeRenderer && (options.preConfig || options.config)) {
    await getMarkdownRenderer()
  }

  const finalize = async (
    artifact: MarkdownCompileResult,
    file: string
  ): Promise<MarkdownCompileResult> => {
    artifact = applyArtifactEnvironmentSafety(
      artifact,
      file,
      artifactPlugins,
      renderBuiltUrl
    )
    const { dynamicRoutes } = getResolutionCache(siteConfig)
    const dynamicRoute = dynamicRoutes.get(file)
    const transforms = [
      siteConfig.transformPageData,
      getPageDataTransformer(dynamicRoute?.[1]!)
    ].filter((fn) => fn != null)

    if (transforms.length === 0) return artifact

    // Hooks can change their input. Keep the cached pre-hook artifact unchanged
    // so each build starts with the same Markdown result.
    let pageData = clonePageData(artifact.pageData)
    for (const transform of transforms) {
      if (transform) {
        const dataToMerge = await transform(pageData, { siteConfig })
        if (dataToMerge) pageData = { ...pageData, ...dataToMerge }
      }
    }

    return {
      ...artifact,
      vueSrc: refreshPageDataCode(artifact, pageData),
      pageData
    }
  }

  const render = (async (
    src: string,
    file: string
  ): Promise<MarkdownCompileResult> => {
    const { dynamicRoutes, rewrites, ts } = getResolutionCache(siteConfig)

    const routeFile = file
    const dynamicRoute = dynamicRoutes.get(file)
    const fileOrig = dynamicRoute?.[0] || file

    file = rewrites.get(normalizeDriveLetter(file)) || file
    const relativePath = slash(path.relative(srcDir, file))

    const cacheKey = JSON.stringify({
      src,
      ts,
      deferPageDataTransforms,
      relativePath
    })
    if (options.cache !== false) {
      const cached = cache.get(cacheKey)
      if (cached) {
        debug(`[cache hit] ${relativePath}`)
        return cached
      }
    }

    const md = await getMarkdownRenderer()

    const start = Date.now()

    // resolve params for dynamic routes
    let params
    src = src.replace(
      /^__VP_PARAMS_START([^]+?)__VP_PARAMS_END__/,
      (_, paramsString) => {
        params = JSON.parse(paramsString)
        return ''
      }
    )

    // resolve includes
    let includes: string[] = []
    src = await processIncludes(md, srcDir, src, fileOrig, includes, cleanUrls)

    const localeIndex = getLocaleForPath(siteConfig?.site, relativePath)

    // reset env before render
    const env: MarkdownEnv = {
      path: file,
      relativePath,
      cleanUrls,
      includes,
      realPath: fileOrig,
      localeIndex
    }
    const html = await md.renderAsync(src, env)
    const {
      content,
      frontmatter = {},
      headers = [],
      linkLines = [],
      links = [],
      sfcBlocks,
      title = ''
    } = env
    const contentLineOffset = countLineBreaks(
      content && src.endsWith(content) ? src.slice(0, -content.length) : ''
    )

    const linkCandidates: PageLinkCandidate[] = links.map((url, index) => ({
      url,
      ...(linkLines[index] == null
        ? {}
        : { line: linkLines[index] + contentLineOffset })
    }))
    const linkContext: PageLinkContext = {
      file: fileOrig,
      pagePath: file
    }
    const deadLinks = validateLinks
      ? resolveDeadLinks(linkCandidates, linkContext, siteConfig)
      : []

    const pageData: PageData = {
      title: inferTitle(md, frontmatter, title),
      titleTemplate: frontmatter.titleTemplate as any,
      description: inferDescription(frontmatter),
      frontmatter,
      headers,
      params,
      relativePath,
      filePath: slash(path.relative(srcDir, fileOrig))
    }

    if (includeLastUpdatedData && frontmatter.lastUpdated !== false) {
      if (frontmatter.lastUpdated instanceof Date) {
        pageData.lastUpdated = +frontmatter.lastUpdated
      } else {
        pageData.lastUpdated = await getGitTimestamp(fileOrig)
      }
    }

    const injectedPageData = injectPageDataCode(
      sfcBlocks?.scripts.map((item) => item.content) ?? [],
      pageData
    )
    const vueSrc = [
      ...injectedPageData.tags,
      `<template><div>${html}</div></template>`,
      ...(sfcBlocks?.styles.map((item) => item.content) ?? []),
      ...(sfcBlocks?.customBlocks.map((item) => item.content) ?? [])
    ].join('\n')
    const unsafeArtifactModuleSemantics = hasUnsafeArtifactModuleSemantics(
      artifactPlugins,
      fileOrig
    )
    const unsafeStaticPluginSemantics = hasUnsafeStaticPluginSemantics(
      artifactPlugins,
      fileOrig
    )
    const staticHtml =
      unsafeStaticPluginSemantics || renderBuiltUrl != null
        ? undefined
        : createStaticHtml(html, sfcBlocks, siteConfig)
    const requiresSourceModuleIdentity = !!(
      sfcBlocks?.scripts?.length ||
      sfcBlocks?.styles?.length ||
      sfcBlocks?.customBlocks?.length ||
      unsafeArtifactModuleSemantics
    )

    debug(`[render] ${file} in ${Date.now() - start}ms.`)

    const result: MarkdownCompileResult = {
      vueSrc,
      html,
      ...(captureSearchSource && dynamicRoute ? { markdownSource: src } : {}),
      ...(captureSearchEnv ? { markdownEnv: snapshotMarkdownEnv(env) } : {}),
      pageData,
      deadLinks,
      linkCandidates,
      linkContext,
      includes,
      ...(injectedPageData.generatedComponentName
        ? { generatedPageComponentName: true as const }
        : {}),
      ...(requiresSourceModuleIdentity
        ? { requiresSourceModuleIdentity: true as const }
        : {}),
      ...(staticHtml == null
        ? {}
        : {
            staticPage: true as const,
            ...(staticHtml === prepareStaticHtmlForSsr(html)
              ? {}
              : { staticHtml })
          })
    }
    const finalized = deferPageDataTransforms
      ? result
      : await finalize(result, routeFile)
    if (options.cache !== false) cache.set(cacheKey, finalized)
    return finalized
  }) as MarkdownToVueRenderFn

  render.finalize = finalize
  return render
}

/** Revalidate cached link facts against current routes, rewrites and public files. */
export function resolveDeadLinks(
  candidates: PageLinkCandidate[],
  context: PageLinkContext,
  siteConfig: SiteConfig
): MarkdownCompileResult['deadLinks'] {
  if (siteConfig.ignoreDeadLinks === true) return []

  let pageCache = deadLinkPageCache.get(siteConfig)
  if (!pageCache || pageCache.source !== siteConfig.pages) {
    pageCache = {
      source: siteConfig.pages,
      pages: new Set(
        siteConfig.pages.map((page) => slash(page.replace(/\.md$/, '')))
      )
    }
    deadLinkPageCache.set(siteConfig, pageCache)
  }
  const { pages } = pageCache
  const deadLinks: MarkdownCompileResult['deadLinks'] = []

  const shouldIgnore = (url: string, file: string) => {
    const { ignoreDeadLinks } = siteConfig
    if (!ignoreDeadLinks) return false
    if (ignoreDeadLinks === 'localhostLinks') {
      return url.replace(EXTERNAL_URL_RE, '').startsWith('//localhost')
    }
    if (!Array.isArray(ignoreDeadLinks)) return false

    return ignoreDeadLinks.some((ignore) => {
      if (typeof ignore === 'string') return url === ignore
      if (ignore instanceof RegExp) {
        ignore.lastIndex = 0
        return ignore.test(url)
      }
      return typeof ignore === 'function' && ignore(url, file)
    })
  }

  for (const candidate of candidates) {
    let url = candidate.url
    const { pathname } = new URL(url, 'http://a.com')
    if (!treatAsHtml(pathname)) continue

    url = url.replace(/[?#].*$/, '').replace(/\.(html|md)$/, '')
    if (url.endsWith('/')) url += 'index'

    const dir = path.dirname(context.pagePath)
    let resolved = decodeURIComponent(
      slash(
        url.startsWith('/')
          ? url.slice(1)
          : path.relative(siteConfig.srcDir, path.resolve(dir, url))
      )
    )
    const rewriteSource = siteConfig.rewrites.inv[resolved + '.md']
    if (rewriteSource) resolved = rewriteSource.slice(0, -3)

    // A link to the pre-rewrite path of a rewritten page still 404s.
    const rewritten = rewriteSource
      ? undefined
      : siteConfig.rewrites.map[resolved + '.md']
    const publicHtml = siteConfig.publicDir
      ? path.join(siteConfig.publicDir, `${resolved}.html`)
      : undefined

    if (
      (!pages.has(resolved) ||
        (rewritten != null && rewritten !== resolved + '.md')) &&
      !(publicHtml && fs.existsSync(publicHtml)) &&
      !shouldIgnore(url, context.file)
    ) {
      deadLinks.push(
        candidate.line == null
          ? { url, file: context.file }
          : { url, file: context.file, line: candidate.line }
      )
    }
  }

  return deadLinks
}

function snapshotMarkdownEnv(env: MarkdownEnv): MarkdownEnv {
  const {
    content,
    excerpt,
    frontmatter,
    headers,
    sfcBlocks,
    title,
    path,
    relativePath,
    cleanUrls,
    links,
    linkLines,
    includes,
    realPath,
    localeIndex
  } = env

  return {
    content,
    excerpt,
    frontmatter,
    headers,
    sfcBlocks,
    title,
    path,
    relativePath,
    cleanUrls,
    links,
    linkLines,
    includes,
    realPath,
    localeIndex
  }
}

const STATIC_HTML_META_ASSET_NAMES = new Set([
  'msapplication-tileimage',
  'msapplication-square70x70logo',
  'msapplication-square150x150logo',
  'msapplication-wide310x150logo',
  'msapplication-square310x310logo',
  'msapplication-config',
  'twitter:image'
])
const STATIC_HTML_META_ASSET_PROPERTIES = new Set([
  'og:image',
  'og:image:url',
  'og:image:secure_url',
  'og:audio',
  'og:audio:secure_url',
  'og:video',
  'og:video:secure_url'
])
const STATIC_HTML_ASSET_SOURCES: Record<
  string,
  { src?: readonly string[]; srcset?: readonly string[] }
> = {
  audio: { src: ['src'] },
  embed: { src: ['src'] },
  img: { src: ['src'], srcset: ['srcset'] },
  image: { src: ['href', 'xlink:href'] },
  input: { src: ['src'] },
  link: { src: ['href'], srcset: ['imagesrcset'] },
  object: { src: ['data'] },
  source: { src: ['src'], srcset: ['srcset'] },
  track: { src: ['src'] },
  use: { src: ['href', 'xlink:href'] },
  video: { src: ['src', 'poster'] },
  meta: { src: ['content'] }
}
const STATIC_BADGE_TYPES = new Set(['info', 'tip', 'warning', 'danger'])

// Use a conservative check. A false negative uses normal Vue SSR. A false
// positive could change output or hydration.
function createStaticHtml(
  html: string,
  sfcBlocks:
    | {
        scripts?: unknown[]
        styles?: unknown[]
        customBlocks?: unknown[]
      }
    | undefined,
  siteConfig: SiteConfig
): string | undefined {
  // The caller checks resolved Vite hooks. Check Vue compiler options here
  // because they can also change the generated template.
  if (hasUnsafeVueTransforms(siteConfig.vue)) {
    return
  }

  if (
    sfcBlocks?.scripts?.length ||
    sfcBlocks?.styles?.length ||
    sfcBlocks?.customBlocks?.length
  ) {
    return
  }

  const expandedHtml = expandStaticDefaultThemeBadges(html, siteConfig)
  if (expandedHtml == null) return

  // Shiki adds `v-pre` so Vue does not parse code blocks. Vue removes this
  // attribute but keeps the subtree. Mask safe subtrees during this check.
  // Then remove `v-pre` from the SSR output to match Vue.
  const inspectedHtml = expandedHtml.replace(
    /<pre\b(?=[^>]*\bv-pre(?:\s|=|>))[^>]*>[^]*?<\/pre>/gi,
    '<pre></pre>'
  )

  // Reject interpolations and Vue shorthand outside Shiki `v-pre` blocks. A
  // false negative uses the compiled module.
  if (/\{\{[^]*?\}\}/.test(inspectedHtml)) return
  if (/<[A-Za-z][^>]*\s(?:v-|[.:@#])[^>]*>/.test(inspectedHtml)) return
  // Vue treats these tags and attributes as VNode control flow. Exclude this
  // HTML from the fast path to preserve SSR output.
  if (/<\/?(?:slot|template)\b/i.test(inspectedHtml)) return
  if (/<[A-Za-z][^>]*\s(?:key|ref|is|slot)(?=\s|=|\/?>)/i.test(inspectedHtml)) {
    return
  }
  if (/<textarea\b[^>]*\svalue(?=\s|=|\/?>)/i.test(inspectedHtml)) return

  // The static path skips the asset URL transform. Accept only final URLs from
  // Vite's default source matrix. Root URLs are unsafe because Vite can hash an
  // asset or add the site base.
  if (hasRewritableStaticAssetUrl(expandedHtml, siteConfig)) return

  const tagRE = /<\/?([A-Za-z][\w.-]*)\b/g
  for (const match of inspectedHtml.matchAll(tagRE)) {
    const tag = match[1]
    if (!isHTMLTag(tag) && !isSVGTag(tag) && !isMathMLTag(tag)) return
  }

  return prepareStaticHtmlForSsr(expandedHtml)
}

/**
 * Replace the default Badge component with its exact SSR markup. Keep slot
 * comments because they mark hydration boundaries. Use the compiled path for
 * non-literal properties or nested markup.
 */
function expandStaticDefaultThemeBadges(
  html: string,
  siteConfig: SiteConfig
): string | undefined {
  if (!/<\/?Badge\b/.test(html)) return html

  // A custom theme can provide a different Badge component. Replace it only
  // when the site uses the built-in default theme.
  if (
    slash(path.resolve(siteConfig.themeDir)) !==
    slash(path.resolve(DEFAULT_THEME_PATH))
  ) {
    return
  }

  let unsupported = false
  const expanded = html.replace(
    /<Badge\b([^>]*)>([^<]*)<\/Badge>/g,
    (source, rawAttributes: string, text: string) => {
      const attributes = new Map<string, string>()
      let consumed = ''
      for (const match of rawAttributes.matchAll(
        /\s+([A-Za-z][\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g
      )) {
        consumed += match[0]
        const name = match[1]
        if (attributes.has(name)) {
          unsupported = true
          return source
        }
        attributes.set(name, match[2] ?? match[3] ?? '')
      }
      if (
        consumed !== rawAttributes ||
        [...attributes].some(([name]) => name !== 'type')
      ) {
        unsupported = true
        return source
      }

      const type = attributes.get('type') || 'tip'
      if (!STATIC_BADGE_TYPES.has(type)) {
        unsupported = true
        return source
      }
      return `<span class="VPBadge ${type}"><!--[-->${text}<!--]--></span>`
    }
  )
  if (unsupported || /<\/?Badge\b/.test(expanded)) return
  return expanded
}

/** @internal Prepare an eligible artifact only while materializing its batch. */
export function prepareStaticHtmlForSsr(html: string): string {
  const withoutVPre = html.replace(
    /(<pre\b[^>]*?)\s+v-pre(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
    '$1'
  )
  return normalizeStaticHtmlWhitespace(withoutVPre)
}

/**
 * Create the client entry for a static page. Store the body in one static
 * vnode. This avoids Vue compilation after the coordinator proves that the
 * page has no runtime behavior.
 */
export function createStaticPageVueSource(
  artifact: MarkdownCompileResult
): string {
  if (!artifact.staticPage) {
    throw new Error('Cannot create a static page module for a dynamic page.')
  }
  const html = artifact.staticHtml ?? prepareStaticHtmlForSsr(artifact.html)
  return `<script>import { createStaticVNode } from 'vue'${createPageDataExportCode(
    artifact.pageData
  )}\nexport default {name:${JSON.stringify(
    artifact.pageData.relativePath
  )},render(){return createStaticVNode(${JSON.stringify(
    `<div>${html}</div>`
  )},1)}}</script>`
}

function normalizeStaticHtmlWhitespace(html: string): string {
  const protectedContents: string[] = []
  const masked = html.replace(
    /(<(pre|textarea)\b[^>]*>)([^]*?)(<\/\2>)/gi,
    (_match, open: string, _tag: string, content: string, close: string) => {
      const index = protectedContents.push(content) - 1
      return `${open}\uE000${index}\uE001${close}`
    }
  )

  // Vue removes newline-only text nodes between elements. Raw Markdown keeps
  // them and can move the hydration cursor. Preserve whitespace inside
  // sensitive elements, but match Vue at normal block boundaries.
  return masked
    .replace(/>\s*\n\s*</g, '><')
    .replace(
      /\uE000(\d+)\uE001/g,
      (_match, index: string) => protectedContents[Number(index)]
    )
    .trim()
}

function hasRewritableStaticAssetUrl(
  html: string,
  siteConfig: SiteConfig
): boolean {
  for (const match of html.matchAll(
    /<([A-Za-z][\w.-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/g
  )) {
    const tag = match[1].toLowerCase()
    const source = STATIC_HTML_ASSET_SOURCES[tag]
    if (!source) continue

    const attributes = new Map<string, string[]>()
    for (const attribute of match[2].matchAll(
      /\s+([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
    )) {
      const name = attribute[1].toLowerCase()
      const values = attributes.get(name) ?? []
      values.push(attribute[2] ?? attribute[3] ?? attribute[4] ?? '')
      attributes.set(name, values)
    }

    if (tag === 'meta' && !isAssetMetaTag(attributes)) continue
    for (const name of source.src ?? []) {
      const values = attributes.get(name) ?? []
      if (
        values.some(
          (value) => value && !isFinalStaticAssetUrl(value, siteConfig)
        )
      ) {
        return true
      }
    }
    for (const name of source.srcset ?? []) {
      const values = attributes.get(name) ?? []
      if (
        values.some((value) => value && !isFinalStaticSrcset(value, siteConfig))
      ) {
        return true
      }
    }
  }
  return false
}

function isAssetMetaTag(attributes: Map<string, string[]>): boolean {
  if (
    attributes
      .get('name')
      ?.some((name) =>
        STATIC_HTML_META_ASSET_NAMES.has(name.trim().toLowerCase())
      )
  ) {
    return true
  }
  return !!attributes
    .get('property')
    ?.some((property) =>
      STATIC_HTML_META_ASSET_PROPERTIES.has(property.trim().toLowerCase())
    )
}

function isFinalStaticSrcset(value: string, siteConfig: SiteConfig): boolean {
  return value.split(',').every((candidate) => {
    const url = candidate.trim().split(/\s+/, 1)[0]
    return !url || isFinalStaticAssetUrl(url, siteConfig, false)
  })
}

function isFinalStaticAssetUrl(
  value: string,
  siteConfig: SiteConfig,
  allowBareHash = true
): boolean {
  const url = value.trim()
  return (
    !url ||
    (allowBareHash && url === '#') ||
    /^data:/i.test(url) ||
    /^(?:https?:)?\/\//.test(url) ||
    isRootPublicAsset(url, siteConfig)
  )
}

function isRootPublicAsset(url: string, siteConfig: SiteConfig): boolean {
  if (
    !url.startsWith('/') ||
    url.startsWith('//') ||
    siteConfig.site.base !== '/' ||
    !siteConfig.publicDir
  ) {
    return false
  }

  let pathname: string
  try {
    pathname = decodeURIComponent(url.replace(/[?#].*$/, ''))
  } catch {
    return false
  }
  const publicDir = path.resolve(siteConfig.publicDir)
  const file = path.resolve(publicDir, `.${pathname}`)
  return (
    (file === publicDir || file.startsWith(`${publicDir}${path.sep}`)) &&
    fs.existsSync(file)
  )
}

/**
 * Use a generated `.vue` ID next to the Markdown source. This location keeps
 * relative asset resolution. It also prevents Markdown pre-transforms from
 * processing the generated SFC a second time.
 */
export function createSsrPageArtifactModuleId(sourceFile: string): string {
  return `${slash(path.resolve(sourceFile))}${SSR_PAGE_ARTIFACT_SUFFIX}`
}

/**
 * Return whether the coordinator can compile the stored SFC. Markdown
 * transforms can depend on the SSR environment. Use the physical module unless
 * the plugin accepts the artifact-safety contract. Resolve and load hooks must
 * not observe the substitute module ID.
 */
export function canCompileSsrPageArtifact(
  siteConfig: SiteConfig,
  sourceFile: string,
  artifact?: { requiresSourceModuleIdentity?: boolean }
): boolean {
  if (artifact) return !artifact.requiresSourceModuleIdentity
  return !hasUnsafeArtifactModuleSemantics(siteConfig.vite?.plugins, sourceFile)
}

type ArtifactAwarePlugin = Plugin<{
  vitepress?: { ssrArtifactSafe?: boolean }
}>

function isVitePressInternalPlugin(plugin: ArtifactAwarePlugin): boolean {
  const name = plugin.name || ''
  return (
    name === 'alias' ||
    name === 'vitepress' ||
    name.startsWith('vite:') ||
    name.startsWith('vitepress:') ||
    name.startsWith('builtin:') ||
    name.startsWith('native:')
  )
}

function isExplicitlyArtifactSafe(plugin: ArtifactAwarePlugin): boolean {
  return plugin.api?.vitepress?.ssrArtifactSafe === true
}

function isInactiveBuildPlugin(plugin: ArtifactAwarePlugin): boolean {
  return plugin.apply === 'serve'
}

function applyArtifactEnvironmentSafety(
  artifact: MarkdownCompileResult,
  sourceFile: string,
  plugins: unknown,
  renderBuiltUrl: unknown
): MarkdownCompileResult {
  const unsafeArtifactModuleSemantics = hasUnsafeArtifactModuleSemantics(
    plugins,
    sourceFile
  )
  const unsafeStaticSemantics =
    hasUnsafeStaticPluginSemantics(plugins, sourceFile) ||
    renderBuiltUrl != null
  if (!unsafeArtifactModuleSemantics && !unsafeStaticSemantics) return artifact
  if (
    (!unsafeArtifactModuleSemantics || artifact.requiresSourceModuleIdentity) &&
    (!unsafeStaticSemantics || !artifact.staticPage)
  ) {
    return artifact
  }

  const safeArtifact = {
    ...artifact,
    ...(unsafeArtifactModuleSemantics
      ? { requiresSourceModuleIdentity: true as const }
      : {})
  }
  if (unsafeStaticSemantics) {
    delete safeArtifact.staticPage
    delete safeArtifact.staticHtml
  }
  return safeArtifact
}

function hasUnsafeArtifactModuleSemantics(
  plugins: unknown,
  sourceFile: string
): boolean {
  return (
    hasUnsafeViteTransforms(plugins, sourceFile) ||
    hasUnsafeSsrArtifactModuleHooks(plugins)
  )
}

function hasUnsafeStaticPluginSemantics(
  plugins: unknown,
  sourceFile: string
): boolean {
  return (
    hasUnsafeViteTransforms(plugins, sourceFile) ||
    hasUnsafeStaticPageModuleHooks(plugins, sourceFile)
  )
}

/**
 * Return whether a Vite environment can use the client Markdown artifact
 * without changing the module pipeline. Check the client and SSR environments
 * separately. `applyToEnvironment` can return different plugins for each one.
 *
 * @internal
 */
export function canReuseSsrPageArtifactWithPlugins(
  plugins: unknown,
  sourceFile: string
): boolean {
  return !hasUnsafeArtifactModuleSemantics(plugins, sourceFile)
}

function hookAppliesToId(hook: unknown, id: string): boolean {
  if (typeof hook === 'function') return true
  if (!hook || typeof hook !== 'object') return false

  const filteredHook = hook as {
    filter?: { id?: unknown }
    handler?: unknown
  }
  if (typeof filteredHook.handler !== 'function') return false
  if (!filteredHook.filter?.id) return true
  try {
    return createFilter(filteredHook.filter.id as never)(id)
  } catch {
    return true
  }
}

function hasUnsafeStaticPageModuleHooks(
  value: unknown,
  sourceFile: string
): boolean {
  if (!value) return false
  if (Array.isArray(value)) {
    return value.some((plugin) =>
      hasUnsafeStaticPageModuleHooks(plugin, sourceFile)
    )
  }
  if (typeof value !== 'object') return false

  const plugin = value as ArtifactAwarePlugin & { then?: unknown }
  if (typeof plugin.then === 'function') return true
  if (
    isVitePressInternalPlugin(plugin) ||
    isExplicitlyArtifactSafe(plugin) ||
    isInactiveBuildPlugin(plugin)
  ) {
    return false
  }

  return (
    hookAppliesToId(plugin.resolveId, sourceFile) ||
    hookAppliesToId(plugin.load, sourceFile)
  )
}

function hasUnsafeSsrArtifactModuleHooks(value: unknown): boolean {
  if (!value) return false
  if (Array.isArray(value)) {
    return value.some(hasUnsafeSsrArtifactModuleHooks)
  }
  if (typeof value !== 'object') return false

  const plugin = value as {
    api?: unknown
    apply?: unknown
    load?: unknown
    name?: unknown
    resolveId?: unknown
    then?: unknown
  }
  // Vite resolves plugin promises later. Until then, assume that their hooks
  // and filters can observe the synthetic ID.
  if (typeof plugin.then === 'function') return true
  const resolvedPlugin = plugin as ArtifactAwarePlugin
  if (
    isVitePressInternalPlugin(resolvedPlugin) ||
    isExplicitlyArtifactSafe(resolvedPlugin) ||
    isInactiveBuildPlugin(resolvedPlugin)
  ) {
    return false
  }

  // `resolveId` filters select the source, not the importer. Load hooks can also
  // apply to page dependencies. Both hooks can observe the synthetic page ID.
  return plugin.resolveId != null || plugin.load != null
}

function hasUnsafeViteTransforms(value: unknown, sourceFile: string): boolean {
  if (!value) return false
  if (Array.isArray(value)) {
    return value.some((plugin) => hasUnsafeViteTransforms(plugin, sourceFile))
  }
  if (typeof value !== 'object') return false

  const plugin = value as {
    api?: unknown
    apply?: unknown
    enforce?: unknown
    name?: unknown
    transform?: unknown
    then?: unknown
  }
  // Vite accepts promised plugin options. Their transform order is not known
  // here, so use the compiled path.
  if (typeof plugin.then === 'function') return true
  const resolvedPlugin = plugin as ArtifactAwarePlugin
  if (
    isVitePressInternalPlugin(resolvedPlugin) ||
    isExplicitlyArtifactSafe(resolvedPlugin) ||
    isInactiveBuildPlugin(resolvedPlugin) ||
    plugin.transform == null
  ) {
    return false
  }

  if (typeof plugin.apply === 'function') return true
  if (typeof plugin.transform === 'function') return true

  const transform = plugin.transform as {
    filter?: { id?: unknown }
    handler?: unknown
  }
  if (typeof transform.handler !== 'function' || !transform.filter?.id) {
    return true
  }

  try {
    const filter = createFilter(transform.filter.id as never)
    const appliesToSource = filter(sourceFile)
    const appliesToArtifact = filter(createSsrPageArtifactModuleId(sourceFile))
    if (!appliesToSource && !appliesToArtifact) return false

    // A source pre-transform can inspect the SSR flag or `this.environment`.
    // Reusing its client result could change server output. Require an explicit
    // promise that its output and side effects do not depend on the environment.
    return true
  } catch {
    return true
  }
}

function hasUnsafeVueTransforms(value: SiteConfig['vue']): boolean {
  if (!value || Object.keys(value).length === 0) return false
  const keys = Object.keys(value)
  if (keys.some((key) => key !== 'template')) return true

  const template = value.template
  if (!template) return false
  if (Object.keys(template).some((key) => key !== 'compilerOptions')) {
    return true
  }

  const compilerOptions = template.compilerOptions
  return !!(
    compilerOptions &&
    Object.keys(compilerOptions).some((key) => key !== 'isCustomElement')
  )
}

function injectPageDataCode(tags: string[], data: PageData) {
  const code = createPageDataExportCode(data)
  let generatedComponentName = false

  const existingScriptIndex = tags.findIndex((tag) => {
    return (
      scriptRE.test(tag) &&
      !scriptSetupRE.test(tag) &&
      !scriptClientRE.test(tag)
    )
  })

  const isUsingTS = tags.findIndex((tag) => scriptLangTsRE.test(tag)) > -1

  if (existingScriptIndex > -1) {
    const tagSrc = tags[existingScriptIndex]
    // user has <script> tag inside markdown
    // if it doesn't have export default it will error out on build
    const hasDefaultExport =
      defaultExportRE.test(tagSrc) || namedDefaultExportRE.test(tagSrc)
    if (!hasDefaultExport) generatedComponentName = true
    tags[existingScriptIndex] = tagSrc.replace(
      scriptRE,
      code +
        (hasDefaultExport
          ? ``
          : createPageComponentDefault(data.relativePath)) +
        `</script>`
    )
  } else {
    generatedComponentName = true
    tags.unshift(
      `<script ${
        isUsingTS ? 'lang="ts"' : ''
      }>${code}${createPageComponentDefault(data.relativePath)}</script>`
    )
  }

  return { tags, generatedComponentName }
}

function refreshPageDataCode(
  artifact: MarkdownCompileResult,
  pageData: PageData
): string {
  const previousCode = createPageDataExportCode(artifact.pageData)
  const nextCode = createPageDataExportCode(pageData)
  if (!artifact.vueSrc.includes(previousCode)) {
    throw new Error(
      `Unable to refresh cached page data for ${artifact.pageData.relativePath}.`
    )
  }

  let vueSrc = artifact.vueSrc.replace(previousCode, nextCode)
  if (
    artifact.generatedPageComponentName &&
    artifact.pageData.relativePath !== pageData.relativePath
  ) {
    const previousDefault = createPageComponentDefault(
      artifact.pageData.relativePath
    )
    if (!vueSrc.includes(previousDefault)) {
      throw new Error(
        `Unable to refresh cached component name for ${artifact.pageData.relativePath}.`
      )
    }
    vueSrc = vueSrc.replace(
      previousDefault,
      createPageComponentDefault(pageData.relativePath)
    )
  }
  return vueSrc
}

function createPageDataExportCode(data: PageData): string {
  return `\nexport const __pageData = JSON.parse(${JSON.stringify(
    JSON.stringify(data)
  )})`
}

function createPageComponentDefault(relativePath: string): string {
  return `\nexport default {name:${JSON.stringify(relativePath)}}`
}

function clonePageData(data: PageData): PageData {
  try {
    return structuredClone(data)
  } catch {
    return clonePageDataValue(data, new Map())
  }
}

function clonePageDataValue<T>(value: T, seen: Map<object, unknown>): T {
  if (value == null || typeof value !== 'object') return value
  if (value instanceof Date) return new Date(value) as unknown as T
  if (value instanceof RegExp) return new RegExp(value) as unknown as T

  const existing = seen.get(value)
  if (existing) return existing as T

  if (Array.isArray(value)) {
    const result: unknown[] = []
    seen.set(value, result)
    for (const item of value) result.push(clonePageDataValue(item, seen))
    return result as unknown as T
  }

  const result = Object.create(Object.getPrototypeOf(value)) as Record<
    PropertyKey,
    unknown
  >
  seen.set(value, result)
  for (const key of Reflect.ownKeys(value)) {
    result[key] = clonePageDataValue(
      (value as Record<PropertyKey, unknown>)[key],
      seen
    )
  }
  return result as unknown as T
}

const inferTitle = (
  md: MarkdownRenderer,
  frontmatter: Record<string, any>,
  title: string
) => {
  if (typeof frontmatter.title === 'string') {
    const titleToken = md.parseInline(frontmatter.title, {})[0]
    if (titleToken) {
      return resolveTitleFromToken(titleToken, {
        shouldAllowHtml: false,
        shouldEscapeText: false
      })
    }
  }
  return title
}

const inferDescription = (frontmatter: Record<string, any>) => {
  const { description, head } = frontmatter

  if (description !== undefined) {
    return description
  }

  return (head && getHeadMetaContent(head, 'description')) || ''
}

function countLineBreaks(str: string) {
  return str.match(/\r?\n/g)?.length ?? 0
}

const getHeadMetaContent = (head: HeadConfig[], name: string) => {
  if (!head || !head.length) {
    return undefined
  }

  const meta = head.find(([tag, attrs = {}]) => {
    return tag === 'meta' && attrs.name === name && attrs.content
  })

  return meta && meta[1].content
}
