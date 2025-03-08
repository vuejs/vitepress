import {
  componentPlugin,
  type ComponentPluginOptions
} from '@mdit-vue/plugin-component'
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
import type {
  LanguageInput,
  ShikiTransformer,
  ThemeRegistrationAny
} from '@shikijs/types'
import anchorPlugin from 'markdown-it-anchor'
import { MarkdownItAsync, type Options } from 'markdown-it-async'
import attrsPlugin from 'markdown-it-attrs'
import { full as emojiPlugin } from 'markdown-it-emoji'
import type { BuiltinLanguage, BuiltinTheme, Highlighter } from 'shiki'
import type { Logger } from 'vite'
import type { Awaitable } from '../shared'
import { containerPlugin, type ContainerOptions } from './plugins/containers'
import { gitHubAlertsPlugin } from './plugins/githubAlerts'
import { highlight as createHighlighter } from './plugins/highlight'
import { highlightLinePlugin } from './plugins/highlightLines'
import { imagePlugin, type Options as ImageOptions } from './plugins/image'
import { lineNumberPlugin } from './plugins/lineNumbers'
import { linkPlugin } from './plugins/link'
import { preWrapperPlugin } from './plugins/preWrapper'
import { restoreEntities } from './plugins/restoreEntities'
import { snippetPlugin } from './plugins/snippet'

export type { Header } from '../shared'

export type ThemeOptions =
  | ThemeRegistrationAny
  | BuiltinTheme
  | {
      light: ThemeRegistrationAny | BuiltinTheme
      dark: ThemeRegistrationAny | BuiltinTheme
    }

export interface MarkdownOptions extends Options {
  /* ==================== General Options ==================== */

  /**
   * Setup markdown-it instance before applying plugins
   */
  preConfig?: (md: MarkdownItAsync) => Awaitable<void>
  /**
   * Setup markdown-it instance
   */
  config?: (md: MarkdownItAsync) => Awaitable<void>
  /**
   * Disable cache (experimental)
   */
  cache?: boolean
  externalLinks?: Record<string, string>

  /* ==================== Syntax Highlighting ==================== */

  /**
   * Custom theme for syntax highlighting.
   *
   * You can also pass an object with `light` and `dark` themes to support dual themes.
   *
   * @example { theme: 'github-dark' }
   * @example { theme: { light: 'github-light', dark: 'github-dark' } }
   *
   * You can use an existing theme.
   * @see https://shiki.style/themes
   * Or add your own theme.
   * @see https://shiki.style/guide/load-theme
   */
  theme?: ThemeOptions
  /**
   * Custom languages for syntax highlighting or pre-load built-in languages.
   * @see https://shiki.style/languages
   */
  languages?: (LanguageInput | BuiltinLanguage)[]
  /**
   * Custom language aliases.
   *
   * @example { 'my-lang': 'js' }
   * @see https://shiki.style/guide/load-lang#custom-language-aliases
   */
  languageAlias?: Record<string, string>
  /**
   * Show line numbers in code blocks
   * @default false
   */
  lineNumbers?: boolean
  /**
   * Fallback language when the specified language is not available.
   */
  defaultHighlightLang?: string
  /**
   * Transformers applied to code blocks
   * @see https://shiki.style/guide/transformers
   */
  codeTransformers?: ShikiTransformer[]
  /**
   * Setup Shiki instance
   */
  shikiSetup?: (shiki: Highlighter) => void | Promise<void>
  /**
   * The tooltip text for the copy button in code blocks
   * @default 'Copy Code'
   */
  codeCopyButtonTitle?: string

  /* ==================== Markdown It Plugins ==================== */

  /**
   * Options for `markdown-it-anchor`
   * @see https://github.com/valeriangalliat/markdown-it-anchor
   */
  anchor?: anchorPlugin.AnchorOptions
  /**
   * Options for `markdown-it-attrs`
   * @see https://github.com/arve0/markdown-it-attrs
   */
  attrs?: {
    leftDelimiter?: string
    rightDelimiter?: string
    allowedAttributes?: Array<string | RegExp>
    disable?: boolean
  }
  /**
   * Options for `markdown-it-emoji`
   * @see https://github.com/markdown-it/markdown-it-emoji
   */
  emoji?: {
    defs?: Record<string, string>
    enabled?: string[]
    shortcuts?: Record<string, string | string[]>
  }
  /**
   * Options for `@mdit-vue/plugin-frontmatter`
   * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-frontmatter
   */
  frontmatter?: FrontmatterPluginOptions
  /**
   * Options for `@mdit-vue/plugin-headers`
   * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-headers
   */
  headers?: HeadersPluginOptions | boolean
  /**
   * Options for `@mdit-vue/plugin-sfc`
   * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-sfc
   */
  sfc?: SfcPluginOptions
  /**
   * Options for `@mdit-vue/plugin-toc`
   * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc
   */
  toc?: TocPluginOptions
  /**
   * Options for `@mdit-vue/plugin-component`
   * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-component
   */
  component?: ComponentPluginOptions
  /**
   * Options for `markdown-it-container`
   * @see https://github.com/markdown-it/markdown-it-container
   */
  container?: ContainerOptions
  /**
   * Math support
   *
   * You need to install `markdown-it-mathjax3` and set `math` to `true` to enable it.
   * You can also pass options to `markdown-it-mathjax3` here.
   * @default false
   * @see https://vitepress.dev/guide/markdown#math-equations
   */
  math?: boolean | any
  image?: ImageOptions
  /**
   * Allows disabling the github alerts plugin
   * @default true
   * @see https://vitepress.dev/guide/markdown#github-flavored-alerts
   */
  gfmAlerts?: boolean
}

export type MarkdownRenderer = MarkdownItAsync

let md: MarkdownRenderer | undefined
let _disposeHighlighter: (() => void) | undefined

export function disposeMdItInstance() {
  if (md) {
    md = undefined
    _disposeHighlighter?.()
  }
}

/**
 * @experimental
 */
export async function createMarkdownRenderer(
  srcDir: string,
  options: MarkdownOptions = {},
  base = '/',
  logger: Pick<Logger, 'warn'> = console
): Promise<MarkdownRenderer> {
  if (md) return md

  const theme = options.theme ?? { light: 'github-light', dark: 'github-dark' }
  const codeCopyButtonTitle = options.codeCopyButtonTitle || 'Copy Code'
  const hasSingleTheme = typeof theme === 'string' || 'name' in theme

  let [highlight, dispose] = options.highlight
    ? [options.highlight, () => {}]
    : await createHighlighter(theme, options, logger)

  _disposeHighlighter = dispose

  md = new MarkdownItAsync({ html: true, linkify: true, highlight, ...options })

  md.linkify.set({ fuzzyLink: false })
  md.use(restoreEntities)

  if (options.preConfig) {
    await options.preConfig(md)
  }

  // custom plugins
  md.use(componentPlugin, { ...options.component })
    .use(highlightLinePlugin)
    .use(preWrapperPlugin, { codeCopyButtonTitle, hasSingleTheme })
    .use(snippetPlugin, srcDir)
    .use(containerPlugin, { hasSingleTheme }, options.container)
    .use(imagePlugin, options.image)
    .use(
      linkPlugin,
      { target: '_blank', rel: 'noreferrer', ...options.externalLinks },
      base
    )
    .use(lineNumberPlugin, options.lineNumbers)

  const tableOpen = md.renderer.rules.table_open
  md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    if (token.attrIndex('tabindex') < 0) token.attrPush(['tabindex', '0'])
    return tableOpen
      ? tableOpen(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options)
  }

  if (options.gfmAlerts !== false) {
    md.use(gitHubAlertsPlugin)
  }

  // third party plugins
  if (!options.attrs?.disable) {
    md.use(attrsPlugin, options.attrs)
  }
  md.use(emojiPlugin, { ...options.emoji })

  // mdit-vue plugins
  md.use(anchorPlugin, {
    slugify,
    getTokensText: (tokens) => {
      return tokens
        .filter((t) => !['html_inline', 'emoji'].includes(t.type))
        .map((t) => t.content)
        .join('')
    },
    permalink: (slug, _, state, idx) => {
      const title =
        state.tokens[idx + 1]?.children
          ?.filter((token) => ['text', 'code_inline'].includes(token.type))
          .reduce((acc, t) => acc + t.content, '')
          .trim() || ''

      const linkTokens = [
        Object.assign(new state.Token('text', '', 0), { content: ' ' }),
        Object.assign(new state.Token('link_open', 'a', 1), {
          attrs: [
            ['class', 'header-anchor'],
            ['href', `#${slug}`],
            ['aria-label', `Permalink to “${title}”`]
          ]
        }),
        Object.assign(new state.Token('html_inline', '', 0), {
          content: '&#8203;',
          meta: { isPermalinkSymbol: true }
        }),
        new state.Token('link_close', 'a', -1)
      ]

      state.tokens[idx + 1].children?.push(...linkTokens)
    },
    ...options.anchor
  } as anchorPlugin.AnchorOptions).use(frontmatterPlugin, {
    ...options.frontmatter
  } as FrontmatterPluginOptions)

  if (options.headers) {
    md.use(headersPlugin, {
      level: [2, 3, 4, 5, 6],
      slugify,
      ...(typeof options.headers === 'boolean' ? undefined : options.headers)
    } as HeadersPluginOptions)
  }

  md.use(sfcPlugin, {
    ...options.sfc
  } as SfcPluginOptions)
    .use(titlePlugin)
    .use(tocPlugin, {
      ...options.toc
    } as TocPluginOptions)

  if (options.math) {
    try {
      const mathPlugin = await import('markdown-it-mathjax3')
      md.use(mathPlugin.default ?? mathPlugin, {
        ...(typeof options.math === 'boolean' ? {} : options.math)
      })
      const orig = md.renderer.rules.math_block!
      md.renderer.rules.math_block = (tokens, idx, options, env, self) => {
        return orig(tokens, idx, options, env, self).replace(
          /^<mjx-container /,
          '<mjx-container tabindex="0" '
        )
      }
    } catch (error) {
      throw new Error(
        'You need to install `markdown-it-mathjax3` to use math support.'
      )
    }
  }

  // apply user config
  if (options.config) {
    await options.config(md)
  }

  return md
}
