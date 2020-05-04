import path from 'path'
import matter from 'gray-matter'
import LRUCache from 'lru-cache'
import { createMarkdownRenderer, MarkdownOptions } from './markdown/markdown'
import { deeplyParseHeader } from './utils/parseHeader'
import { PageData } from './config'

const debug = require('debug')('vitepress:md')
const cache = new LRUCache<string, MarkdownCompileResult>({ max: 1024 })

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
    lastUpdated: number,
    injectData = true
  ) => {
    file = path.relative(root, file)
    const cached = cache.get(src)
    if (cached) {
      debug(`[cache hit] ${file}`)
      return cached
    }
    const start = Date.now()

    const { content, data: frontmatter } = matter(src)
    const { html, data } = md.render(content)

    // TODO validate data.links?

    // inject page data
    const pageData: PageData = {
      title: inferTitle(frontmatter, content),
      frontmatter,
      headers: data.headers,
      lastUpdated
    }

    const additionalBlocks = injectData
      ? injectPageData(data.hoistedTags || [], pageData)
      : data.hoistedTags || []

    // double wrapping since tempalte root node is never hoisted or turned into
    // a static node.
    const vueSrc =
      `<template><div><div class="vitepress-content">${html}</div></div></template>\n` +
      additionalBlocks.join('\n')
    debug(`[render] ${file} in ${Date.now() - start}ms.`)

    const result = { vueSrc, pageData }
    cache.set(src, result)
    return result
  }
}

const scriptRE = /<\/script>/

function injectPageData(tags: string[], data: PageData) {
  const code = `\nexport const __pageData = ${JSON.stringify(
    JSON.stringify(data)
  )}`
  const existingScriptIndex = tags.findIndex((tag) => scriptRE.test(tag))
  if (existingScriptIndex > -1) {
    tags[existingScriptIndex] = tags[existingScriptIndex].replace(
      scriptRE,
      code + `</script>`
    )
  } else {
    tags.push(`<script>${code}\nexport default {}</script>`)
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
