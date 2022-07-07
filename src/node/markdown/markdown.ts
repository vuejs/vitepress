import MarkdownIt from 'markdown-it'
import { Theme } from 'shiki'
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
import { headingPlugin } from './plugins/headings'
import { imagePlugin } from './plugins/image'
import { Header } from '../shared'
import anchor from 'markdown-it-anchor'
import attrs from 'markdown-it-attrs'
import emoji from 'markdown-it-emoji'
import toc from 'markdown-it-toc-done-right'
import container from 'markdown-it-container'
import Token from 'markdown-it/lib/token'
import { Mermaid } from 'mermaid'

export type ThemeOptions = Theme | { light: Theme; dark: Theme }

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
    disable?: boolean
  }
  theme?: ThemeOptions
  // https://github.com/nagaozen/markdown-it-toc-done-right
  toc?: any
  externalLinks?: Record<string, string>
  // https://mermaid-js.github.io/mermaid/#/Setup?id=configuration
  mermaid?: ReturnType<Mermaid['mermaidAPI']['getConfig']> & {
    disable?: boolean
  }
}

export interface MarkdownParsedData {
  hoistedTags?: string[]
  links?: string[]
  headers?: Header[]
}

export interface MarkdownRenderer extends MarkdownIt {
  __path: string
  __relativePath: string
  __data: MarkdownParsedData
}

export type { Header }

export const createMarkdownRenderer = async (
  srcDir: string,
  options: MarkdownOptions = {},
  base = '/'
): Promise<MarkdownRenderer> => {
  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight: options.highlight || (await highlight(options.theme)),
    ...options
  }) as MarkdownRenderer

  // custom plugins
  md.use(componentPlugin)
    .use(highlightLinePlugin)
    .use(preWrapperPlugin)
    .use(snippetPlugin, srcDir)
    .use(hoistPlugin)
    .use(containerPlugin)
    .use(headingPlugin)
    .use(imagePlugin)
    .use(
      linkPlugin,
      {
        target: '_blank',
        rel: 'noopener noreferrer',
        ...options.externalLinks
      },
      base
    )

  // 3rd party plugins
  if (!options.attrs?.disable) {
    md.use(attrs, options.attrs)
  }

  md.use(anchor, {
    slugify,
    permalink: anchor.permalink.ariaHidden({}),
    ...options.anchor
  })
    .use(toc, {
      slugify,
      level: [2, 3],
      format: (x: string, htmlencode: (s: string) => string) =>
        htmlencode(parseHeader(x)),
      listType: 'ul',
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

  if (!options.mermaid?.disable) {
    md.use(container, 'mermaid', {
      render: (tokens: Token[], idx: number) => {
        if (tokens[idx].nesting === 1) {
          // opening tag
          const content = tokens.filter(
            (t, i) => i > idx && t.level === 2 && t.nesting === 0
          )[0]?.content
          return `<Mermaid src="${content}" >`
        } else {
          // closing tag
          return '</Mermaid>\n'
        }
      }
    })
  }

  const originalRender = md.render
  md.render = (...args) => {
    md.__data = {}
    return originalRender.call(md, ...args)
  }

  return md
}
