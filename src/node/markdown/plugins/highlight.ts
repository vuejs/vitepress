import { customAlphabet } from 'nanoid'
import c from 'picocolors'
import type { ShikijiTransformer } from 'shikiji'
import {
  bundledLanguages,
  getHighlighter,
  addClassToHast,
  isPlaintext as isPlainLang,
  isSpecialLang
} from 'shikiji'
import type { Logger } from 'vite'
import type { MarkdownOptions, ThemeOptions } from '../markdown'
import {
  transformerCompactLineOptions,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  type TransformerCompactLineOption
} from 'shikiji-transformers'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10)

/**
 * 2 steps:
 *
 * 1. convert attrs into line numbers:
 *    {4,7-13,16,23-27,40} -> [4,7,8,9,10,11,12,13,16,23,24,25,26,27,40]
 * 2. convert line numbers into line options:
 *    [{ line: number, classes: string[] }]
 */
const attrsToLines = (attrs: string): TransformerCompactLineOption[] => {
  attrs = attrs.replace(/^(?:\[.*?\])?.*?([\d,-]+).*/, '$1').trim()
  const result: number[] = []
  if (!attrs) {
    return []
  }
  attrs
    .split(',')
    .map((v) => v.split('-').map((v) => parseInt(v, 10)))
    .forEach(([start, end]) => {
      if (start && end) {
        result.push(
          ...Array.from({ length: end - start + 1 }, (_, i) => start + i)
        )
      } else {
        result.push(start)
      }
    })
  return result.map((v) => ({
    line: v,
    classes: ['highlighted']
  }))
}

export async function highlight(
  theme: ThemeOptions,
  options: MarkdownOptions,
  logger: Pick<Logger, 'warn'> = console
): Promise<(str: string, lang: string, attrs: string) => string> {
  const {
    defaultHighlightLang: defaultLang = '',
    codeTransformers: userTransformers = []
  } = options

  const highlighter = await getHighlighter({
    themes:
      typeof theme === 'string' || 'name' in theme
        ? [theme]
        : [theme.light, theme.dark],
    langs: [...Object.keys(bundledLanguages), ...(options.languages || [])],
    langAlias: options.languageAlias
  })

  await options?.shikijiSetup?.(highlighter)

  const transformers: ShikijiTransformer[] = [
    transformerNotationDiff(),
    transformerNotationFocus({
      classActiveLine: 'has-focus',
      classActivePre: 'has-focused-lines'
    }),
    transformerNotationHighlight(),
    transformerNotationErrorLevel(),
    {
      name: 'vitepress:add-class',
      pre(node) {
        addClassToHast(node, 'vp-code')
      }
    },
    {
      name: 'vitepress:clean-up',
      pre(node) {
        delete node.properties.tabindex
        delete node.properties.style
      }
    }
  ]

  const vueRE = /-vue$/
  const lineNoStartRE = /=(\d*)/
  const lineNoRE = /:(no-)?line-numbers(=\d*)?$/
  const mustacheRE = /\{\{.*?\}\}/g

  return (str: string, lang: string, attrs: string) => {
    const vPre = vueRE.test(lang) ? '' : 'v-pre'
    lang =
      lang
        .replace(lineNoStartRE, '')
        .replace(lineNoRE, '')
        .replace(vueRE, '')
        .toLowerCase() || defaultLang

    if (lang) {
      const langLoaded = highlighter.getLoadedLanguages().includes(lang as any)
      if (!langLoaded && !isPlainLang(lang) && !isSpecialLang(lang)) {
        logger.warn(
          c.yellow(
            `\nThe language '${lang}' is not loaded, falling back to '${
              defaultLang || 'txt'
            }' for syntax highlighting.`
          )
        )
        lang = defaultLang
      }
    }

    const lineOptions = attrsToLines(attrs)
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

    const fillEmptyHighlightedLine = (s: string) => {
      return s.replace(
        /(<span class="line highlighted">)(<\/span>)/g,
        '$1<wbr>$2'
      )
    }

    str = removeMustache(str).trimEnd()

    const highlighted = highlighter.codeToHtml(str, {
      lang,
      transformers: [
        ...transformers,
        transformerCompactLineOptions(lineOptions),
        {
          name: 'vitepress:v-pre',
          pre(node) {
            if (vPre) node.properties['v-pre'] = ''
          }
        },
        ...userTransformers
      ],
      meta: {
        __raw: attrs
      },
      ...(typeof theme === 'string' || 'name' in theme
        ? { theme }
        : {
            themes: theme,
            defaultColor: false
          })
    })

    return fillEmptyHighlightedLine(restoreMustache(highlighted))
  }
}
