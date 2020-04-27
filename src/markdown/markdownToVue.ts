import path from 'path'
import { createMarkdownRenderer, MarkdownOpitons } from './markdown'
import LRUCache from 'lru-cache'

const matter = require('gray-matter')
const debug = require('debug')('vitepress:md')
const cache = new LRUCache<string, string>({ max: 1024 })

export function createMarkdownToVueRenderFn(
  root: string,
  options: MarkdownOpitons = {}
) {
  const md = createMarkdownRenderer(options)

  return (src: string, file: string) => {
    file = path.relative(root, file)
    const cached = cache.get(src)
    if (cached) {
      debug(`[cache hit] ${file}`)
      return cached
    }
    const start = Date.now()

    const { content, data } = matter(src)
    const { html } = md.render(content)

    // TODO validate links?

    const vueSrc =
      `<template>${html}</template>` + (data.hoistedTags || []).join('\n')
    debug(`[render] ${file} in ${Date.now() - start}ms.`, data)
    cache.set(src, vueSrc)
    return vueSrc
  }
}
