import path from 'path'
import matter from 'gray-matter'
import LRUCache from 'lru-cache'
import { createMarkdownRenderer, MarkdownOpitons } from './markdown/markdown'
import { Header } from './markdown/plugins/header'
import { deeplyParseHeader } from './utils/parseHeader'

const debug = require('debug')('vitepress:md')
const cache = new LRUCache<string, string>({ max: 1024 })

export function createMarkdownToVueRenderFn(
  root: string,
  options: MarkdownOpitons = {}
) {
  const md = createMarkdownRenderer(options)

  return (src: string, file: string, lastUpdated: number) => {
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
    const additionalBlocks = injectPageData(
      data.hoistedTags || [],
      content,
      frontmatter,
      data.headers || [],
      lastUpdated
    )

    const vueSrc =
      `<template><div class="vitepress-content">${html}</div></template>\n` +
      additionalBlocks.join('\n')
    debug(`[render] ${file} in ${Date.now() - start}ms.`)
    cache.set(src, vueSrc)
    return vueSrc
  }
}

const scriptRE = /<\/script>/
function injectPageData(
  tags: string[],
  content: string,
  frontmatter: object,
  headers: Header[],
  lastUpdated: number
) {
  const code = `\nexport const __pageData = ${JSON.stringify({
    title: inferTitle(frontmatter, content),
    frontmatter,
    headers,
    lastUpdated
  })}`

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
}
