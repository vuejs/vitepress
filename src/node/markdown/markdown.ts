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
import anchor from 'markdown-it-anchor'
import attrs from 'markdown-it-attrs'
import emoji from 'markdown-it-emoji'
import toc from 'markdown-it-table-of-contents'

export interface MarkdownOptions extends MarkdownIt.Options {
  lineNumbers?: boolean
  config?: (md: MarkdownIt) => void
  anchor?: {
    permalink?: anchor.AnchorOptions['permalink']
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
  __path: string
  __relativePath: string
  __data: MarkdownParsedData
  render: (
    src: string,
    path: string,
    relatiovePath: string
  ) => { html: string; data: any }
}

export type { Header }

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
    // 3rd party plugins
    .use(attrs, options.attrs)
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

  const wrappedMd = md as any as MarkdownRenderer

  // wrap render so that we can return both the html and extracted data.
  const render = md.render
  wrappedMd.render = (src, path, relativePath) => {
    wrappedMd.__data = {}
    wrappedMd.__path = path
    wrappedMd.__relativePath = relativePath
    const html = render.call(md, src)
    return {
      html,
      data: wrappedMd.__data
    }
  }

  return wrappedMd
}
