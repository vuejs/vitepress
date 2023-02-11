import MarkdownIt from 'markdown-it'
import anchorPlugin from 'markdown-it-anchor'
import attrsPlugin from 'markdown-it-attrs'
import emojiPlugin from 'markdown-it-emoji'
import { componentPlugin } from '@mdit-vue/plugin-component'
import {
  frontmatterPlugin,
  type FrontmatterPluginOptions
} from '@mdit-vue/plugin-frontmatter'
import {
  headersPlugin,
  type HeadersPluginOptions
} from '@mdit-vue/plugin-headers'
import { sfcPlugin, type SfcPluginOptions } from '@mdit-vue/plugin-sfc'
import { titlePlugin } from '@mdit-vue/plugin-title'
import { tocPlugin, type TocPluginOptions } from '@mdit-vue/plugin-toc'
import { slugify } from '@mdit-vue/shared'
import type { IThemeRegistration } from 'shiki'
import { highlight } from './plugins/highlight'
import { highlightLinePlugin } from './plugins/highlightLines'
import { lineNumberPlugin } from './plugins/lineNumbers'
import { containerPlugin } from './plugins/containers'
import { snippetPlugin } from './plugins/snippet'
import { preWrapperPlugin } from './plugins/preWrapper'
import { linkPlugin } from './plugins/link'
import { imagePlugin } from './plugins/image'

export type { Header } from '../shared'

export type ThemeOptions =
  | IThemeRegistration
  | { light: IThemeRegistration; dark: IThemeRegistration }

export interface MarkdownOptions extends MarkdownIt.Options {
  lineNumbers?: boolean
  config?: (md: MarkdownIt) => void
  anchor?: anchorPlugin.AnchorOptions
  attrs?: {
    leftDelimiter?: string
    rightDelimiter?: string
    allowedAttributes?: string[]
    disable?: boolean
  }
  defaultHighlightLang?: string
  frontmatter?: FrontmatterPluginOptions
  headers?: HeadersPluginOptions
  sfc?: SfcPluginOptions
  theme?: ThemeOptions
  toc?: TocPluginOptions
  externalLinks?: Record<string, string>
}

export type MarkdownRenderer = MarkdownIt

export const createMarkdownRenderer = async (
  srcDir: string,
  options: MarkdownOptions = {},
  base = '/'
): Promise<MarkdownRenderer> => {
  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight:
      options.highlight ||
      (await highlight(options.theme, options.defaultHighlightLang)),
    ...options
  }) as MarkdownRenderer

  // custom plugins
  md.use(componentPlugin)
    .use(highlightLinePlugin)
    .use(preWrapperPlugin)
    .use(snippetPlugin, srcDir)
    .use(containerPlugin)
    .use(imagePlugin)
    .use(
      linkPlugin,
      { target: '_blank', rel: 'noreferrer', ...options.externalLinks },
      base
    )
    .use(lineNumberPlugin, options.lineNumbers)

  // 3rd party plugins
  if (!options.attrs?.disable) {
    md.use(attrsPlugin, options.attrs)
  }
  md.use(emojiPlugin)

  // mdit-vue plugins
  md.use(anchorPlugin, {
    slugify,
    permalink: anchorPlugin.permalink.ariaHidden({}),
    ...options.anchor
  } as anchorPlugin.AnchorOptions)
    .use(frontmatterPlugin, {
      ...options.frontmatter
    } as FrontmatterPluginOptions)
    .use(headersPlugin, {
      ...options.headers
    } as HeadersPluginOptions)
    .use(sfcPlugin, {
      ...options.sfc
    } as SfcPluginOptions)
    .use(titlePlugin)
    .use(tocPlugin, {
      ...options.toc
    } as TocPluginOptions)

  // apply user config
  if (options.config) {
    options.config(md)
  }

  return md
}
