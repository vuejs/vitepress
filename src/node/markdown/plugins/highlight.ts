import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight
} from '@shikijs/transformers'
import { customAlphabet } from 'nanoid'
import c from 'picocolors'
import type { BundledLanguage, ShikiTransformer } from 'shiki'
import { createHighlighter, guessEmbeddedLanguages, isSpecialLang } from 'shiki'
import type { Logger } from 'vite'
import { isShell } from '../../shared'
import type { MarkdownOptions, ThemeOptions } from '../markdown'

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
  theme: ThemeOptions,
  options: MarkdownOptions,
  logger: Pick<Logger, 'warn'> = console
): Promise<
  [(str: string, lang: string, attrs: string) => Promise<string>, () => void]
> {
  const {
    defaultHighlightLang: defaultLang = 'txt',
    codeTransformers: userTransformers = []
  } = options

  const langAlias = Object.fromEntries(
    Object.entries(options.languageAlias || {}) //
      .map(([k, v]) => [k.toLowerCase(), v])
  )

  const highlighter = await createHighlighter({
    themes:
      typeof theme === 'object' && 'light' in theme && 'dark' in theme
        ? [theme.light, theme.dark]
        : [theme],
    langs: [...(options.languages || []), ...Object.values(langAlias)],
    langAlias
  })

  await options?.shikiSetup?.(highlighter)

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

      try {
        // https://github.com/shikijs/shiki/issues/952
        if (
          !isSpecialLang(lang) &&
          !highlighter.getLoadedLanguages().includes(lang)
        ) {
          await highlighter.loadLanguage(lang as any)
        }
      } catch {
        logger.warn(
          c.yellow(
            `\nThe language '${lang}' is not loaded, falling back to '${defaultLang}' for syntax highlighting.`
          )
        )
        lang = defaultLang
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
          : { theme })
      })

      return restoreMustache(highlighted)
    },
    highlighter.dispose
  ]
}
