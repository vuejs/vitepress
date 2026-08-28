import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight
} from '@shikijs/transformers'
import { customAlphabet } from 'nanoid'
import c from 'picocolors'
import type {
  BuiltinLanguage,
  BuiltinTheme,
  BundledHighlighterOptions,
  BundledLanguage,
  CodeToHastOptions,
  Highlighter,
  ShikiTransformer,
  SpecialLanguage,
  StringLiteralUnion,
  ThemeRegistrationAny
} from 'shiki'
import { createHighlighter, guessEmbeddedLanguages, isSpecialLang } from 'shiki'
import type { Logger } from 'vite'

import { isShell, type Awaitable } from '../../shared'

export type ThemeOptions =
  | ThemeRegistrationAny
  | BuiltinTheme
  | {
      light: ThemeRegistrationAny | BuiltinTheme
      dark: ThemeRegistrationAny | BuiltinTheme
    }

type BundledShikiOptions = BundledHighlighterOptions<
  BuiltinLanguage,
  BuiltinTheme
>

/**
 * Shiki options for syntax highlighting in code blocks. Members that map
 * directly to Shiki (`langs`, `langAlias`, `transformers`,
 * `colorReplacements`) use Shiki's own option names and types; `theme`,
 * `defaultLang`, and `setup` are VitePress-specific.
 * @see https://shiki.style
 */
export interface ShikiOptions {
  /**
   * Custom theme for syntax highlighting.
   *
   * You can also pass an object with `light` and `dark` themes to support
   * dual themes.
   *
   * @example { theme: 'github-dark' }
   * @example { theme: { light: 'github-light', dark: 'github-dark' } }
   *
   * You can use an existing theme.
   * @see https://shiki.style/themes
   * Or add your own theme.
   * @see https://shiki.style/guide/load-theme
   *
   * @default { light: 'github-light', dark: 'github-dark' }
   */
  theme?: ThemeOptions
  /**
   * Custom languages for syntax highlighting or pre-load built-in languages.
   * @see https://shiki.style/languages
   * @see https://shiki.style/guide/load-lang
   */
  langs?: BundledShikiOptions['langs']
  /**
   * Custom language aliases for syntax highlighting.
   * Maps custom language names to existing languages.
   * Alias lookup is case-insensitive and underscores in language names are
   * displayed as spaces.
   *
   * @example
   *
   * Maps `my_lang` to use Python syntax highlighting.
   * ```js
   * { 'my_lang': 'python' }
   * ```
   *
   * Usage in markdown:
   * ````md
   * ```My_Lang
   * # This will be highlighted as Python code
   * # and will show "My Lang" as the language label
   * print("Hello, World!")
   * ```
   * ````
   *
   * @see https://shiki.style/guide/load-lang#custom-language-aliases
   */
  langAlias?: BundledShikiOptions['langAlias']
  /**
   * Language used for code blocks that don't specify a language, or specify
   * a language that is not available.
   * @default 'txt'
   */
  defaultLang?: StringLiteralUnion<BuiltinLanguage | SpecialLanguage>
  /**
   * Transformers applied to code blocks.
   * @see https://shiki.style/guide/transformers
   */
  transformers?: ShikiTransformer[]
  /**
   * Color replacements applied during syntax highlighting.
   * Accepts either a flat color map or per-theme replacements.
   * @see https://shiki.style/guide/theme-colors#color-replacements
   */
  colorReplacements?: CodeToHastOptions['colorReplacements']
  /**
   * Configure the Shiki highlighter instance after it is created.
   */
  setup?: (shiki: Highlighter) => Awaitable<void>
}

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10)

/**
 * Prevents the leading '$' symbol etc from being selectable/copyable. Also
 * normalizes its syntax so there's no leading spaces, and only a single
 * trailing space.
 *
 * NOTE: Any changes to this function may also need to update
 * `src/client/app/composables/copyCode.ts`
 */
function transformerDisableShellSymbolSelect(): ShikiTransformer {
  return {
    name: 'vitepress:disable-shell-symbol-select',
    tokens(tokensByLine) {
      if (!isShell(this.options.lang)) return

      for (const tokens of tokensByLine) {
        if (tokens.length < 2) continue

        // The first token should only be a symbol token
        const firstTokenText = tokens[0].content.trim()
        if (firstTokenText !== '$' && firstTokenText !== '>') continue

        // The second token must have a leading space (separates the symbol)
        if (tokens[1].content[0] !== ' ') continue

        tokens[0].content = firstTokenText + ' '
        tokens[0].htmlStyle ??= {}
        tokens[0].htmlStyle['user-select'] = 'none'
        tokens[0].htmlStyle['-webkit-user-select'] = 'none'
        tokens[1].content = tokens[1].content.slice(1)
      }
    }
  }
}

export async function highlight(
  options: ShikiOptions = {},
  logger: Pick<Logger, 'warn'> = console
): Promise<
  [(str: string, lang: string, attrs: string) => Promise<string>, () => void]
> {
  // `??` instead of destructuring defaults so that plain-JS configs passing
  // `null` still get the defaults
  const theme = options.theme ?? { light: 'github-light', dark: 'github-dark' }
  const defaultLang = options.defaultLang ?? 'txt'
  const userTransformers = options.transformers ?? []

  const langAlias = Object.fromEntries(
    Object.entries(options.langAlias || {}) //
      .map(([k, v]) => [k.toLowerCase(), v])
  )

  const highlighter = await createHighlighter({
    themes:
      typeof theme === 'object' && 'light' in theme && 'dark' in theme
        ? [theme.light, theme.dark]
        : [theme],
    langs: [...(options.langs || []), ...Object.values(langAlias)],
    langAlias
  })

  await options.setup?.(highlighter)

  // https://github.com/shikijs/shiki/issues/952
  const loadLanguage = async (lang: string) => {
    try {
      if (
        !isSpecialLang(lang) &&
        !highlighter.getLoadedLanguages().includes(lang)
      ) {
        await highlighter.loadLanguage(lang as any)
      }
      return true
    } catch {
      return false
    }
  }

  const transformers: ShikiTransformer[] = [
    transformerMetaHighlight(),
    transformerNotationDiff(),
    transformerNotationFocus({
      classActiveLine: 'has-focus',
      classActivePre: 'has-focused-lines'
    }),
    transformerNotationHighlight(),
    transformerNotationErrorLevel(),
    transformerDisableShellSymbolSelect(),
    {
      name: 'vitepress:add-dir',
      pre(node) {
        node.properties.dir = 'ltr'
      }
    }
  ]

  // keep in sync with ./preWrapper.ts#extractLang
  const langRE = /^[a-zA-Z0-9-_]+/
  const vueRE = /-vue$/

  return [
    async (str, lang, attrs) => {
      const match = langRE.exec(lang)
      if (match) {
        const orig = lang
        lang = match[0].toLowerCase()
        attrs = orig.slice(lang.length).replace(/(?<!=)\{/g, ' {') + ' ' + attrs
        attrs = attrs.trim().replace(/\s+/g, ' ')
      }

      lang ||= defaultLang

      const vPre = !vueRE.test(lang)
      if (!vPre) lang = lang.slice(0, -4)

      if (!(await loadLanguage(lang))) {
        logger.warn(
          c.yellow(
            `\nThe language '${lang}' is not loaded, falling back to '${defaultLang}' for syntax highlighting.`
          )
        )
        lang = defaultLang
        if (!(await loadLanguage(lang))) {
          logger.warn(
            c.yellow(
              `\nThe default language '${lang}' is not loaded, falling back to 'txt' for syntax highlighting.`
            )
          )
          lang = 'txt'
        }
      }

      const mustaches = new Map<string, string>()

      const removeMustache = (s: string) => {
        if (vPre) return s
        return s.replace(/\{\{.*?\}\}/g, (match) => {
          let marker = mustaches.get(match)
          if (!marker) {
            marker = nanoid()
            mustaches.set(match, marker)
          }
          return marker
        })
      }

      const restoreMustache = (s: string) => {
        mustaches.forEach((marker, match) => {
          s = s.replaceAll(marker, match)
        })
        return s
      }

      str = removeMustache(str).trimEnd()

      const embeddedLang = guessEmbeddedLanguages(str, lang, highlighter)
      await highlighter.loadLanguage(...(embeddedLang as BundledLanguage[]))

      const highlighted = highlighter.codeToHtml(str, {
        lang,
        transformers: [
          ...transformers,
          {
            name: 'vitepress:v-pre',
            pre(node) {
              if (vPre) node.properties['v-pre'] = ''
            }
          },
          {
            name: 'vitepress:empty-line',
            code(hast) {
              hast.children.forEach((span) => {
                if (
                  span.type === 'element' &&
                  span.tagName === 'span' &&
                  Array.isArray(span.properties.class) &&
                  span.properties.class.includes('line') &&
                  span.children.length === 0
                ) {
                  span.children.push({
                    type: 'element',
                    tagName: 'wbr',
                    properties: {},
                    children: []
                  })
                }
              })
            }
          },
          ...userTransformers
        ],
        meta: { __raw: attrs },
        ...(typeof theme === 'object' && 'light' in theme && 'dark' in theme
          ? { themes: theme, defaultColor: false }
          : { theme }),
        colorReplacements: {
          'github-light': {
            '#959da5': '#6c676f',
            '#28a745': '#0e790b',
            '#b08800': '#846312',
            '#e36209': '#c13617',
            '#3192aa': '#05728b',
            '#d73a49': '#c62739',
            '#22863a': '#11782a',
            '#6a737d': '#62687b',
            '#1b7c83': '#06747a',
            '#0366d6': '#0663d0',
            '#cb2431': '#c82430'
          },
          'github-dark': {
            '#586069': '#5b93a3',
            '#6a737d': '#818e99',
            '#ea4a5a': '#ef5564',
            '#2188ff': '#268bf9'
          },
          ...options.colorReplacements
        }
      })

      return restoreMustache(highlighted)
    },
    highlighter.dispose
  ]
}
