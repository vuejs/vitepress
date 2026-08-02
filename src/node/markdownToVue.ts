import { resolveTitleFromToken } from '@mdit-vue/shared'
import { LRUCache } from 'lru-cache'
import fs from 'node:fs'
import path from 'node:path'
import { createDebug } from 'obug'
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

let __dynamicRoutes = new Map<string, [string, string]>()
let __rewrites = new Map<string, string>()
let __ts: number

export interface MarkdownCompileResult {
  vueSrc: string
  /** Rendered Markdown body before Vue's SFC compiler processes it. */
  html: string
  /** Markdown after include/snippet expansion, reusable by local search. */
  markdownSource?: string
  pageData: PageData
  deadLinks: { url: string; file: string; line?: number }[]
  /** Raw link facts used to revalidate routes/public files every build. */
  linkCandidates?: PageLinkCandidate[]
  linkContext?: PageLinkContext
  includes: string[]
  /**
   * Marks a cached module refresh after page-data hooks. Do not rewrite user
   * default exports as component names.
   */
  generatedPageComponentName?: true
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
  deferPageDataTransforms = false
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
  const captureSearchSource =
    typeof localSearchOptions?._transformHtml === 'function' ||
    typeof localSearchOptions?._render === 'function'
  let mdPromise: Promise<MarkdownRenderer> | undefined
  const getMarkdownRenderer = () =>
    (mdPromise ??= createMarkdownRenderer(
      srcDir,
      mergeMarkdownLocales(options, siteConfig?.site.locales),
      base,
      siteConfig?.logger,
      siteConfig?.publicDir
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
    if (!deferPageDataTransforms && options.cache !== false) {
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
    debug(`[render] ${file} in ${Date.now() - start}ms.`)

    const result: MarkdownCompileResult = {
      vueSrc,
      html,
      ...(captureSearchSource && dynamicRoute ? { markdownSource: src } : {}),
      pageData,
      deadLinks,
      linkCandidates,
      linkContext,
      includes,
      ...(injectedPageData.generatedComponentName
        ? { generatedPageComponentName: true as const }
        : {})
    }
    const finalized = deferPageDataTransforms
      ? result
      : await finalize(result, routeFile)
    if (!deferPageDataTransforms && options.cache !== false) {
      cache.set(cacheKey, finalized)
    }
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
