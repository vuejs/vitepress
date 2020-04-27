import MarkdownIt from 'markdown-it'
import { parseHeaders } from '../utils/parseHeaders'
import { highlight } from './highlight'
import { slugify } from './slugify'
import { highlightLinePlugin } from './highlightLines'
import { lineNumberPlugin } from './lineNumbers'
import { componentPlugin } from './component'
import { containerPlugin } from './containers'
import { snippetPlugin } from './snippet'
import { hoistPlugin } from './hoist'
import { preWrapperPlugin } from './preWrapper'
import { linkPlugin } from './link'

const emoji = require('markdown-it-emoji')
const anchor = require('markdown-it-anchor')
const toc = require('markdown-it-table-of-contents')

export interface MarkdownOpitons extends MarkdownIt.Options {
  lineNumbers?: boolean
  config?: (md: MarkdownIt) => void
  anchor?: {
    permalink?: boolean
    permalinkBefore?: boolean
    permalinkSymbol?: string
  }
  // https://github.com/Oktavilla/markdown-it-table-of-contents
  toc?: any
  externalLinks?: Record<string, string>
}

export interface MarkdownRenderer {
  __data?: any
  render: (src: string, env?: any) => { html: string; data: any }
}

export const createMarkdownRenderer = (
  options: MarkdownOpitons = {}
): MarkdownRenderer => {
  const md = MarkdownIt({
    html: true,
    highlight,
    ...options
  })

  // custom plugins
  md
    .use(componentPlugin)
    .use(highlightLinePlugin)
    .use(preWrapperPlugin)
    .use(snippetPlugin)
    .use(hoistPlugin)
    .use(containerPlugin)
    .use(linkPlugin, {
      target: '_blank',
      rel: 'noopener noreferrer',
      ...options.externalLinks
    })

    // 3rd party plugins
    .use(emoji)
    .use(
      anchor,
      Object.assign(
        {
          slugify,
          permalink: true,
          permalinkBefore: true,
          permalinkSymbol: '#'
        },
        options.anchor
      )
    )
    .use(
      toc,
      Object.assign(
        {
          slugify,
          includeLevel: [2, 3],
          format: parseHeaders
        },
        options.toc
      )
    )

  // apply user config
  if (options.config) {
    options.config(md)
  }

  if (options.lineNumbers) {
    md.use(lineNumberPlugin)
  }

  dataReturnable(md)

  return md as any
}

export const dataReturnable = (md: MarkdownIt) => {
  // override render to allow custom plugins return data
  const render = md.render
  const wrappedRender: MarkdownRenderer['render'] = (src) => {
    (md as any).__data = {}
    const html = render.call(md, src)
    return {
      html,
      data: (md as any).__data
    }
  }

  ;(md as any).render = wrappedRender
}
