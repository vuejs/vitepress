import fs from 'fs'
import path from 'path'
import c from 'picocolors'
import matter from 'gray-matter'
import LRUCache from 'lru-cache'
import { PageData, HeadConfig, EXTERNAL_URL_RE } from './shared'
import { slash } from './utils/slash'
import { deeplyParseHeader } from './utils/parseHeader'
import { getGitTimestamp } from './utils/getGitTimestamp'
import { createMarkdownRenderer, MarkdownOptions } from './markdown/markdown'
import _debug from 'debug'

const debug = _debug('vitepress:md')
const cache = new LRUCache<string, MarkdownCompileResult>({ max: 1024 })
const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g

export interface MarkdownCompileResult {
  vueSrc: string
  pageData: PageData
  deadLinks: string[]
  includes: string[]
}

export async function createMarkdownToVueRenderFn(
  srcDir: string,
  options: MarkdownOptions = {},
  pages: string[],
  userDefines: Record<string, any> | undefined,
  isBuild = false,
  base: string,
  includeLastUpdatedData = false
) {
  const md = await createMarkdownRenderer(srcDir, options, base)

  pages = pages.map((p) => slash(p.replace(/\.md$/, '')))

  const userDefineRegex = userDefines
    ? new RegExp(
        `\\b(${Object.keys(userDefines)
          .map((key) => key.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'))
          .join('|')})`,
        'g'
      )
    : null

  return async (
    src: string,
    file: string,
    publicDir: string
  ): Promise<MarkdownCompileResult> => {
    const relativePath = slash(path.relative(srcDir, file))
    const dir = path.dirname(file)

    const cached = cache.get(src)
    if (cached) {
      debug(`[cache hit] ${relativePath}`)
      return cached
    }

    const start = Date.now()

    // resolve includes
    let includes: string[] = []
    src = src.replace(includesRE, (_, m1) => {
      const includePath = path.join(dir, m1)
      const content = fs.readFileSync(includePath, 'utf-8')
      includes.push(slash(includePath))
      return content
    })

    const { content, data: frontmatter } = matter(src)

    // reset state before render
    md.__path = file
    md.__relativePath = relativePath

    let html = md.render(content)
    const data = md.__data

    if (isBuild) {
      // avoid env variables being replaced by vite
      html = html
        .replace(/\bimport\.meta/g, 'import.<wbr/>meta')
        .replace(/\bprocess\.env/g, 'process.<wbr/>env')

      // also avoid replacing vite user defines
      if (userDefineRegex) {
        html = html.replace(
          userDefineRegex,
          (_) => `${_[0]}<wbr/>${_.slice(1)}`
        )
      }
    }

    // validate data.links
    const deadLinks: string[] = []
    const recordDeadLink = (url: string) => {
      console.warn(
        c.yellow(
          `\n(!) Found dead link ${c.cyan(url)} in file ${c.white(c.dim(file))}`
        )
      )
      deadLinks.push(url)
    }

    if (data.links) {
      const dir = path.dirname(file)
      for (let url of data.links) {
        if (/\.(?!html|md)\w+($|\?)/i.test(url)) continue

        if (url.replace(EXTERNAL_URL_RE, '').startsWith('//localhost:')) {
          recordDeadLink(url)
          continue
        }

        url = url.replace(/[?#].*$/, '').replace(/\.(html|md)$/, '')
        if (url.endsWith('/')) url += `index`
        const resolved = decodeURIComponent(
          slash(
            url.startsWith('/')
              ? url.slice(1)
              : path.relative(srcDir, path.resolve(dir, url))
          )
        )
        if (
          !pages.includes(resolved) &&
          !fs.existsSync(path.resolve(dir, publicDir, `${resolved}.html`))
        ) {
          recordDeadLink(url)
        }
      }
    }

    const pageData: PageData = {
      title: inferTitle(frontmatter, content),
      titleTemplate: frontmatter.titleTemplate,
      description: inferDescription(frontmatter),
      frontmatter,
      headers: data.headers || [],
      relativePath
    }

    if (includeLastUpdatedData) {
      pageData.lastUpdated = await getGitTimestamp(file)
    }

    const vueSrc =
      genPageDataCode(data.hoistedTags || [], pageData).join('\n') +
      `\n<template><div>${html}</div></template>`

    debug(`[render] ${file} in ${Date.now() - start}ms.`)

    const result = {
      vueSrc,
      pageData,
      deadLinks,
      includes
    }
    cache.set(src, result)
    return result
  }
}

const scriptRE = /<\/script>/
const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*/
const scriptClientRe = /<\s*script[^>]*\bclient\b[^>]*/
const defaultExportRE = /((?:^|\n|;)\s*)export(\s*)default/
const namedDefaultExportRE = /((?:^|\n|;)\s*)export(.+)as(\s*)default/

function genPageDataCode(tags: string[], data: PageData) {
  const code = `\nexport const __pageData = ${JSON.stringify(
    JSON.stringify(data)
  )}`

  const existingScriptIndex = tags.findIndex((tag) => {
    return (
      scriptRE.test(tag) &&
      !scriptSetupRE.test(tag) &&
      !scriptClientRe.test(tag)
    )
  })

  if (existingScriptIndex > -1) {
    const tagSrc = tags[existingScriptIndex]
    // user has <script> tag inside markdown
    // if it doesn't have export default it will error out on build
    const hasDefaultExport =
      defaultExportRE.test(tagSrc) || namedDefaultExportRE.test(tagSrc)
    tags[existingScriptIndex] = tagSrc.replace(
      scriptRE,
      code + (hasDefaultExport ? `` : `\nexport default{}\n`) + `</script>`
    )
  } else {
    tags.unshift(`<script>${code}\nexport default {}</script>`)
  }

  return tags
}

const inferTitle = (frontmatter: Record<string, any>, content: string) => {
  if (frontmatter.title) {
    return deeplyParseHeader(frontmatter.title)
  }

  const match = content.match(/^\s*#+\s+(.*)/m)

  if (match) {
    return deeplyParseHeader(match[1].trim())
  }

  return ''
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
