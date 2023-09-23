import { resolveTitleFromToken } from '@mdit-vue/shared'
import _debug from 'debug'
import fs from 'fs-extra'
import { LRUCache } from 'lru-cache'
import path from 'path'
import type { SiteConfig } from './config'
import {
  createMarkdownRenderer,
  type MarkdownOptions,
  type MarkdownRenderer
} from './markdown'
import {
  EXTERNAL_URL_RE,
  slash,
  type HeadConfig,
  type MarkdownEnv,
  type PageData
} from './shared'
import { getGitTimestamp } from './utils/getGitTimestamp'
import { processIncludes } from './utils/processIncludes'

const debug = _debug('vitepress:md')
const cache = new LRUCache<string, MarkdownCompileResult>({ max: 1024 })

export interface MarkdownCompileResult {
  vueSrc: string
  pageData: PageData
  deadLinks: { url: string; file: string }[]
  includes: string[]
}

export function clearCache(file?: string) {
  if (!file) {
    cache.clear()
    return
  }

  file = JSON.stringify({ file }).slice(1)
  cache.find((_, key) => key.endsWith(file!) && cache.delete(key))
}

export async function createMarkdownToVueRenderFn(
  srcDir: string,
  options: MarkdownOptions = {},
  pages: string[],
  userDefines: Record<string, any> | undefined,
  isBuild = false,
  base = '/',
  includeLastUpdatedData = false,
  cleanUrls = false,
  siteConfig: SiteConfig | null = null
) {
  const md = await createMarkdownRenderer(
    srcDir,
    options,
    base,
    siteConfig?.logger
  )
  pages = pages.map((p) => slash(p.replace(/\.md$/, '')))
  const replaceRegex = genReplaceRegexp(userDefines, isBuild)

  return async (
    src: string,
    file: string,
    publicDir: string
  ): Promise<MarkdownCompileResult> => {
    const fileOrig = file
    const alias =
      siteConfig?.rewrites.map[file] || // virtual dynamic path file
      siteConfig?.rewrites.map[file.slice(srcDir.length + 1)]
    file = alias ? path.join(srcDir, alias) : file
    const relativePath = slash(path.relative(srcDir, file))
    const cacheKey = JSON.stringify({ src, file: fileOrig })

    if (isBuild || options.cache !== false) {
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
    src = processIncludes(srcDir, src, fileOrig, includes)

    // reset env before render
    const env: MarkdownEnv = {
      path: file,
      relativePath,
      cleanUrls,
      includes,
      realPath: fileOrig
    }
    const html = md.render(src, env)
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
      deadLinks.push({ url, file: path.relative(srcDir, fileOrig) })
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
          return ignore(url)
        }
        return false
      })
    }

    if (links) {
      const dir = path.dirname(file)
      for (let url of links) {
        if (/\.(?!html|md)\w+($|\?)/i.test(url)) continue

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

    if (includeLastUpdatedData) {
      pageData.lastUpdated = await getGitTimestamp(fileOrig)
    }

    if (siteConfig?.transformPageData) {
      const dataToMerge = await siteConfig.transformPageData(pageData, {
        siteConfig
      })
      if (dataToMerge) {
        pageData = {
          ...pageData,
          ...dataToMerge
        }
      }
    }

    const vueSrc = [
      ...injectPageDataCode(
        sfcBlocks?.scripts.map((item) => item.content) ?? [],
        pageData,
        replaceRegex
      ),
      `<template><div>${replaceConstants(
        html,
        replaceRegex,
        vueTemplateBreaker
      )}</div></template>`,
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
      cache.set(cacheKey, result)
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
const jsStringBreaker = '\u200b'
const vueTemplateBreaker = '<wbr>'

function genReplaceRegexp(
  userDefines: Record<string, any> = {},
  isBuild: boolean
): RegExp {
  // `process.env` need to be handled in both dev and build
  // @see https://github.com/vitejs/vite/blob/cad27ee8c00bbd5aeeb2be9bfb3eb164c1b77885/packages/vite/src/node/plugins/clientInjections.ts#L57-L64
  const replacements = ['process.env']
  if (isBuild) {
    replacements.push('import.meta', ...Object.keys(userDefines))
  }
  return new RegExp(
    `\\b(${replacements
      .map((key) => key.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'))
      .join('|')})`,
    'g'
  )
}

/**
 * To avoid env variables being replaced by vite:
 * - insert `'\u200b'` char into those strings inside js string (page data)
 * - insert `<wbr>` tag into those strings inside html string (vue template)
 *
 * @see https://vitejs.dev/guide/env-and-mode.html#production-replacement
 */
function replaceConstants(str: string, replaceRegex: RegExp, breaker: string) {
  return str.replace(replaceRegex, (_) => `${_[0]}${breaker}${_.slice(1)}`)
}

function injectPageDataCode(
  tags: string[],
  data: PageData,
  replaceRegex: RegExp
) {
  const dataJson = JSON.stringify(data)
  const code = `\nexport const __pageData = JSON.parse(${JSON.stringify(
    replaceConstants(dataJson, replaceRegex, jsStringBreaker)
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

const getHeadMetaContent = (
  head: HeadConfig[],
  name: string
): string | undefined => {
  if (!head || !head.length) {
    return undefined
  }

  const meta = head.find(([tag, attrs = {}]) => {
    return tag === 'meta' && attrs.name === name && attrs.content
  })

  return meta && meta[1].content
}
