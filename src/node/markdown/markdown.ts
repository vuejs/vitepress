import MarkdownIt from 'markdown-it'
import { parseHeader } from '../utils/parseHeader'
import { highlight } from './plugins/highlight'
import { slugify } from './plugins/slugify'
import { highlightLinePlugin } from './plugins/highlightLines'
import { lineNumberPlugin } from './plugins/lineNumbers'
import { componentPlugin } from './plugins/component'
import { containerPlugin } from './plugins/containers'
import { snippetPlugin } from './plugins/snippet'
import { hoistPlugin } from './plugins/hoist'
import { preWrapperPlugin } from './plugins/preWrapper'
import { linkPlugin } from './plugins/link'
import { extractHeaderPlugin } from './plugins/header'
import { Header } from '../shared'
import anchor, { AnchorOptions } from 'markdown-it-anchor'

const attrs = require('markdown-it-attrs')
const emoji = require('markdown-it-emoji')
const toc = require('markdown-it-table-of-contents')

export interface MarkdownOptions extends MarkdownIt.Options {
  lineNumbers?: boolean
  config?: (md: MarkdownIt) => void
  anchor?: {
    permalink?: AnchorOptions['permalink']
  }
  attrs?: {
    leftDelimiter?: string
    rightDelimiter?: string
    allowedAttributes?: string[]
  }
  // https://github.com/Oktavilla/markdown-it-table-of-contents
  toc?: any
  externalLinks?: Record<string, string>
}

export interface MarkdownParsedData {
  hoistedTags?: string[]
  links?: string[]
  headers?: Header[]
}

export interface MarkdownRenderer {
  __data: MarkdownParsedData
  render: (src: string, env?: any) => { html: string; data: any }
}

export const createMarkdownRenderer = (
  srcDir: string,
  options: MarkdownOptions = {}
): MarkdownRenderer => {
  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight,
    ...options
  })

  // custom plugins
  md.use(componentPlugin)
    .use(highlightLinePlugin)
    .use(preWrapperPlugin)
    .use(snippetPlugin, srcDir)
    .use(hoistPlugin)
    .use(containerPlugin)
    .use(extractHeaderPlugin)
    .use(linkPlugin, {
      target: '_blank',
      rel: 'noopener noreferrer',
      ...options.externalLinks
    })

    .use(attrs, {
      leftDelimiter: '{',
      rightDelimiter: '}',
      allowedAttributes: [],
      ...options.attrs
    })
    // 3rd party plugins
    .use(anchor, {
      slugify,
      permalink: anchor.permalink.ariaHidden({}),
      ...options.anchor
    })
    .use(toc, {
      slugify,
      includeLevel: [2, 3],
      format: parseHeader,
      ...options.toc
    })
    .use(emoji)

  // apply user config
  if (options.config) {
    options.config(md)
  }

  if (options.lineNumbers) {
    md.use(lineNumberPlugin)
  }

  // wrap render so that we can return both the html and extracted data.
  const render = md.render
  const wrappedRender: MarkdownRenderer['render'] = (src) => {
    ;(md as any).__data = {}
    const html = render.call(md, src)
    return {
      html,
      data: (md as any).__data
    }
  }
  ;(md as any).render = wrappedRender

  return md as any
}
