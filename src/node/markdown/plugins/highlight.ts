import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
} from '@shikijs/transformers'
import { customAlphabet } from 'nanoid'
import c from 'picocolors'
import type { BundledLanguage, ShikiTransformer } from 'shiki'
import { createHighlighter, guessEmbeddedLanguages, isSpecialLang } from 'shiki'
import type { Logger } from 'vite'
import type { MarkdownOptions, ThemeOptions } from '../markdown'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10)

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

  const highlighter = await createHighlighter({
    themes:
      typeof theme === 'object' && 'light' in theme && 'dark' in theme
        ? [theme.light, theme.dark]
        : [theme],
    langs: [
      ...(options.languages || []),
      ...Object.values(options.languageAlias || {})
    ],
    langAlias: options.languageAlias
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
    {
      name: 'vitepress:add-dir',
      pre(node) {
        node.properties.dir = 'ltr'
      }
    }
  ]

  const vueRE = /-vue(?=:|$)/
  const lineNoStartRE = /=(\d*)/
  const lineNoRE = /:(no-)?line-numbers(=\d*)?$/
  const mustacheRE = /\{\{.*?\}\}/g

  return [
    async (str: string, lang: string, attrs: string) => {
      const vPre = vueRE.test(lang) ? '' : 'v-pre'
      lang =
        lang
          .replace(lineNoStartRE, '')
          .replace(lineNoRE, '')
          .replace(vueRE, '')
          .toLowerCase() || defaultLang

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
        return s.replace(mustacheRE, (match) => {
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
