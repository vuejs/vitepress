import { resolveTitleFromToken } from '@mdit-vue/shared'
import _debug from 'debug'
import fs from 'fs-extra'
import { LRUCache } from 'lru-cache'
import path from 'node:path'
import type { SiteConfig } from './config'
import {
  createMarkdownRenderer,
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

const debug = _debug('vitepress:md')

interface MemoryAwareCache<K extends {}, V extends {}> {
  cache: LRUCache<K, V>
  adjustCacheSize: () => void
  getCurrentSize: () => number
  getMaxSize: () => number
  recreateCache: (newMax: number) => void
}

function createMemoryAwareLRUCache<K extends {}, V extends {}>(
  initialMax = 1024
): MemoryAwareCache<K, V> {
  let currentMax = initialMax
  let cache = new LRUCache<K, V>({ max: currentMax })
  let lastMemoryCheck = 0

  function recreateCache(newMax: number) {
    // Since max is read-only, we need to create a new cache with reduced size
    const oldEntries: Array<[K, V]> = []
    const entriesToKeep = Math.min(newMax, cache.size)

    // Extract most recent entries from old cache
    let entriesCollected = 0
    for (const entry of cache.rentries()) {
      if (entriesCollected >= entriesToKeep) break
      const [key, value] = entry as [K, V]
      oldEntries.push([key, value])
      entriesCollected++
    }

    // Create new cache with new max size
    cache = new LRUCache<K, V>({ max: newMax })
    currentMax = newMax

    // Restore entries to new cache (in reverse order to maintain recency)
    for (let i = oldEntries.length - 1; i >= 0; i--) {
      const [key, value] = oldEntries[i]
      cache.set(key, value)
    }
  }

  function adjustCacheSize() {
    const now = Date.now()
    // Only check memory every 100ms to avoid performance overhead
    if (now - lastMemoryCheck < 100) return
    lastMemoryCheck = now

    try {
      const memUsage = process.memoryUsage()
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024
      const memoryPressure = heapUsedMB / heapTotalMB

      // If using >75% of heap, reduce cache size aggressively
      if (memoryPressure > 0.75) {
        const newMax = Math.max(64, Math.floor(currentMax * 0.5))
        if (newMax < currentMax) {
          debug(
            `[memory] High pressure (${(memoryPressure * 100).toFixed(1)}%), reducing cache from ${currentMax} to ${newMax}`
          )
          recreateCache(newMax)
        }
      }
      // If using >60% of heap, reduce cache moderately
      else if (memoryPressure > 0.6) {
        const newMax = Math.max(128, Math.floor(currentMax * 0.7))
        if (newMax < currentMax) {
          debug(
            `[memory] Medium pressure (${(memoryPressure * 100).toFixed(1)}%), reducing cache from ${currentMax} to ${newMax}`
          )
          recreateCache(newMax)
        }
      }
      // If memory pressure is low and cache is small, allow it to grow back
      else if (memoryPressure < 0.4 && currentMax < initialMax) {
        const newMax = Math.min(initialMax, Math.floor(currentMax * 1.2))
        if (newMax > currentMax) {
          debug(
            `[memory] Low pressure (${(memoryPressure * 100).toFixed(1)}%), increasing cache from ${currentMax} to ${newMax}`
          )
          recreateCache(newMax)
        }
      }
    } catch (error) {
      // Silently handle any memory monitoring errors
      debug(`[memory] Error monitoring memory: ${error}`)
    }
  }

  return {
    cache,
    adjustCacheSize,
    getCurrentSize: () => cache.size,
    getMaxSize: () => currentMax,
    recreateCache
  }
}

const memoryAwareCache = createMemoryAwareLRUCache<
  string,
  MarkdownCompileResult
>(1024)
const getCache = () => memoryAwareCache.cache

export interface MarkdownCompileResult {
  vueSrc: string
  pageData: PageData
  deadLinks: { url: string; file: string }[]
  includes: string[]
}

export function clearCache(relativePath?: string) {
  const cache = getCache()
  if (!relativePath) {
    cache.clear()
    debug(`[cache] Cleared all cache entries`)
    return
  }

  relativePath = JSON.stringify({ relativePath }).slice(1)
  const sizeBefore = cache.size
  cache.find((_, key) => key.endsWith(relativePath!) && cache.delete(key))
  const sizeAfter = cache.size
  debug(`[cache] Cleared ${sizeBefore - sizeAfter} entries for ${relativePath}`)
}

// Export memory statistics for debugging/monitoring
export function getCacheStats() {
  return {
    size: memoryAwareCache.getCurrentSize(),
    maxSize: memoryAwareCache.getMaxSize(),
    memoryUsage: process.memoryUsage()
  }
}

let __pages: string[] = []
let __dynamicRoutes = new Map<string, [string, string]>()
let __rewrites = new Map<string, string>()
let __ts: number

function getResolutionCache(siteConfig: SiteConfig) {
  // @ts-expect-error internal
  if (siteConfig.__dirty) {
    __pages = siteConfig.pages.map((p) => slash(p.replace(/\.md$/, '')))

    __dynamicRoutes = new Map(
      siteConfig.dynamicRoutes.map((r) => [
        r.fullPath,
        [slash(path.join(siteConfig.srcDir, r.route)), r.loaderPath]
      ])
    )

    __rewrites = new Map(
      Object.entries(siteConfig.rewrites.map).map(([key, value]) => [
        slash(path.join(siteConfig.srcDir, key)),
        slash(path.join(siteConfig.srcDir, value!))
      ])
    )

    __ts = Date.now()

    // @ts-expect-error internal
    siteConfig.__dirty = false
  }

  return {
    pages: __pages,
    dynamicRoutes: __dynamicRoutes,
    rewrites: __rewrites,
    ts: __ts
  }
}

export async function createMarkdownToVueRenderFn(
  srcDir: string,
  options: MarkdownOptions = {},
  isBuild = false,
  base = '/',
  includeLastUpdatedData = false,
  cleanUrls = false,
  siteConfig: SiteConfig
) {
  const md = await createMarkdownRenderer(
    srcDir,
    options,
    base,
    siteConfig?.logger
  )

  return async (
    src: string,
    file: string,
    publicDir: string
  ): Promise<MarkdownCompileResult> => {
    const { pages, dynamicRoutes, rewrites, ts } =
      getResolutionCache(siteConfig)

    const dynamicRoute = dynamicRoutes.get(file)
    const fileOrig = dynamicRoute?.[0] || file
    const transformPageData = [
      siteConfig?.transformPageData,
      getPageDataTransformer(dynamicRoute?.[1]!)
    ].filter((fn) => fn != null)

    file = rewrites.get(file) || file
    const relativePath = slash(path.relative(srcDir, file))

    const cacheKey = JSON.stringify({ src, ts, relativePath })
    if (isBuild || options.cache !== false) {
      // Check memory pressure before cache access
      memoryAwareCache.adjustCacheSize()

      const cache = getCache()
      const cached = cache.get(cacheKey)
      if (cached) {
        debug(`[cache hit] ${relativePath}`)
        return cached
      }
    }

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
    src = processIncludes(md, srcDir, src, fileOrig, includes, cleanUrls)

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
      frontmatter = {},
      headers = [],
      links = [],
      sfcBlocks,
      title = ''
    } = env

    // validate data.links
    const deadLinks: MarkdownCompileResult['deadLinks'] = []
    const recordDeadLink = (url: string) => {
      deadLinks.push({ url, file: fileOrig })
    }

    function shouldIgnoreDeadLink(url: string) {
      if (!siteConfig?.ignoreDeadLinks) {
        return false
      }
      if (siteConfig.ignoreDeadLinks === true) {
        return true
      }
      if (siteConfig.ignoreDeadLinks === 'localhostLinks') {
        return url.replace(EXTERNAL_URL_RE, '').startsWith('//localhost')
      }

      return siteConfig.ignoreDeadLinks.some((ignore) => {
        if (typeof ignore === 'string') {
          return url === ignore
        }
        if (ignore instanceof RegExp) {
          return ignore.test(url)
        }
        if (typeof ignore === 'function') {
          return ignore(url, fileOrig)
        }
        return false
      })
    }

    if (links && siteConfig?.ignoreDeadLinks !== true) {
      const dir = path.dirname(file)
      for (let url of links) {
        const { pathname } = new URL(url, 'http://a.com')
        if (!treatAsHtml(pathname)) continue

        url = url.replace(/[?#].*$/, '').replace(/\.(html|md)$/, '')
        if (url.endsWith('/')) url += `index`
        let resolved = decodeURIComponent(
          slash(
            url.startsWith('/')
              ? url.slice(1)
              : path.relative(srcDir, path.resolve(dir, url))
          )
        )
        resolved =
          siteConfig?.rewrites.inv[resolved + '.md']?.slice(0, -3) || resolved
        if (
          !pages.includes(resolved) &&
          !fs.existsSync(path.resolve(dir, publicDir, `${resolved}.html`)) &&
          !shouldIgnoreDeadLink(url)
        ) {
          recordDeadLink(url)
        }
      }
    }

    let pageData: PageData = {
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

    for (const fn of transformPageData) {
      if (fn) {
        const dataToMerge = await fn(pageData, { siteConfig })
        if (dataToMerge) {
          pageData = {
            ...pageData,
            ...dataToMerge
          }
        }
      }
    }

    const vueSrc = [
      ...injectPageDataCode(
        sfcBlocks?.scripts.map((item) => item.content) ?? [],
        pageData
      ),
      `<template><div>${html}</div></template>`,
      ...(sfcBlocks?.styles.map((item) => item.content) ?? []),
      ...(sfcBlocks?.customBlocks.map((item) => item.content) ?? [])
    ].join('\n')

    debug(`[render] ${file} in ${Date.now() - start}ms.`)

    const result = {
      vueSrc,
      pageData,
      deadLinks,
      includes
    }
    if (isBuild || options.cache !== false) {
      // Check memory pressure before caching result
      memoryAwareCache.adjustCacheSize()

      const cache = getCache()
      cache.set(cacheKey, result)

      // Log cache statistics periodically for debugging
      if (debug.enabled && cache.size % 100 === 0) {
        debug(
          `[cache] Size: ${memoryAwareCache.getCurrentSize()}/${memoryAwareCache.getMaxSize()}, Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
        )
      }
    }
    return result
  }
}

const scriptRE = /<\/script>/
const scriptLangTsRE = /<\s*script[^>]*\blang=['"]ts['"][^>]*/
const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*/
const scriptClientRE = /<\s*script[^>]*\bclient\b[^>]*/
const defaultExportRE = /((?:^|\n|;)\s*)export(\s*)default/
const namedDefaultExportRE = /((?:^|\n|;)\s*)export(.+)as(\s*)default/

function injectPageDataCode(tags: string[], data: PageData) {
  const code = `\nexport const __pageData = JSON.parse(${JSON.stringify(
    JSON.stringify(data)
  )})`

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
    tags[existingScriptIndex] = tagSrc.replace(
      scriptRE,
      code +
        (hasDefaultExport
          ? ``
          : `\nexport default {name:${JSON.stringify(data.relativePath)}}`) +
        `</script>`
    )
  } else {
    tags.unshift(
      `<script ${
        isUsingTS ? 'lang="ts"' : ''
      }>${code}\nexport default {name:${JSON.stringify(
        data.relativePath
      )}}</script>`
    )
  }

  return tags
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

const getHeadMetaContent = (head: HeadConfig[], name: string) => {
  if (!head || !head.length) {
    return undefined
  }

  const meta = head.find(([tag, attrs = {}]) => {
    return tag === 'meta' && attrs.name === name && attrs.content
  })

  return meta && meta[1].content
}
