import path from 'path'
import { createMarkdownRenderer, MarkdownOpitons } from './markdown/index'
import LRUCache from 'lru-cache'

const debug = require('debug')('vitepress:md')
const cache = new LRUCache<string, string>({ max: 1024 })

const matter = require('gray-matter')

export function createMarkdownFn(root: string, options: MarkdownOpitons = {}) {
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

    // TODO make use of data

    const vueSrc = `<template>${html}</template>`
    debug(`[render] ${file} in ${Date.now() - start}ms.`, data)
    cache.set(src, vueSrc)
    return vueSrc
  }
}
