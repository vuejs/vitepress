import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import LRUCache from 'lru-cache'
import { createMarkdownRenderer, MarkdownOptions } from './markdown/markdown'
import { deeplyParseHeader } from './utils/parseHeader'
import { PageData, HeadConfig } from '../../types/shared'
import slash from 'slash'

const debug = require('debug')('vitepress:md')
const cache = new LRUCache<string, MarkdownCompileCachedResult>({ max: 1024 })

interface MarkdownCompileCachedResult extends MarkdownCompileResult {
  tagsWithPageData: string
  tagsWithoutPageData: string
}

interface MarkdownCompileResult {
  vueSrc: string
  pageData: PageData
}

export function createMarkdownToVueRenderFn(
  root: string,
  options: MarkdownOptions = {}
) {
  const md = createMarkdownRenderer(options)

  return (
    src: string,
    file: string,
    injectData = true
  ): MarkdownCompileResult => {
    const relativePath = slash(path.relative(root, file))

    const cached = cache.get(src)
    if (cached) {
      debug(`[cache hit] ${relativePath}`)
      return pickResult(cached, injectData)
    }

    const start = Date.now()

    const { content, data: frontmatter } = matter(src)
    const { html, data } = md.render(content)

    const vueSrc = `\n<template><div>${html}</div></template>`

    // TODO validate data.links?
    const pageData: PageData = {
      title: inferTitle(frontmatter, content),
      description: inferDescription(frontmatter),
      frontmatter,
      headers: data.headers,
      relativePath,
      // TODO use git timestamp?
      lastUpdated: fs.statSync(file).mtimeMs
    }

    const tagsWithPageData = genPageDataCode(
      data.hoistedTags || [],
      pageData
    ).join('\n')

    const tagsWithoutPageData = (data.hoistedTags || []).join('\n')

    debug(`[render] ${file} in ${Date.now() - start}ms.`)

    const result = {
      vueSrc,
      pageData,
      tagsWithPageData,
      tagsWithoutPageData
    }
    cache.set(src, result)
    return pickResult(result, injectData)
  }
}

function pickResult(
  res: MarkdownCompileCachedResult,
  injectData: boolean
): MarkdownCompileResult {
  return {
    vueSrc:
      res.vueSrc +
      (injectData ? res.tagsWithPageData : res.tagsWithoutPageData),
    pageData: res.pageData
  }
}

const scriptRE = /<\/script>/
const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*/
const defaultExportRE = /((?:^|\n|;)\s*)export(\s*)default/
const namedDefaultExportRE = /((?:^|\n|;)\s*)export(.+)as(\s*)default/

function genPageDataCode(tags: string[], data: PageData) {
  const code = `\nexport const __pageData = ${JSON.stringify(
    JSON.stringify(data)
  )}`

  const existingScriptIndex = tags.findIndex((tag) => {
    return scriptRE.test(tag) && !scriptSetupRE.test(tag)
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

const inferTitle = (frontmatter: any, content: string) => {
  if (frontmatter.home) {
    return 'Home'
  }
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
  if (!frontmatter.head) {
    return ''
  }

  return getHeadMetaContent(frontmatter.head, 'description') || ''
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
