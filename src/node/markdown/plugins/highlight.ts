import type { HtmlRendererOptions, IThemeRegistration } from 'shiki'
import {
  addClass,
  createDiffProcessor,
  createFocusProcessor,
  createHighlightProcessor,
  createRangeProcessor,
  defineProcessor,
  getHighlighter,
  type Processor
} from 'shiki-processor'
import type { ThemeOptions } from '../markdown'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10)

/**
 * 2 steps:
 *
 * 1. convert attrs into line numbers:
 *    {4,7-13,16,23-27,40} -> [4,7,8,9,10,11,12,13,16,23,24,25,26,27,40]
 * 2. convert line numbers into line options:
 *    [{ line: number, classes: string[] }]
 */
const attrsToLines = (attrs: string): HtmlRendererOptions['lineOptions'] => {
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

const errorLevelProcessor = defineProcessor({
  name: 'error-level',
  handler: createRangeProcessor({
    error: ['highlighted', 'error'],
    warning: ['highlighted', 'warning']
  })
})

export async function highlight(
  theme: ThemeOptions = 'material-palenight',
  defaultLang: string = ''
): Promise<(str: string, lang: string, attrs: string) => string> {
  const hasSingleTheme = typeof theme === 'string' || 'name' in theme
  const getThemeName = (themeValue: IThemeRegistration) =>
    typeof themeValue === 'string' ? themeValue : themeValue.name

  const processors: Processor[] = [
    createFocusProcessor(),
    createHighlightProcessor({ hasHighlightClass: 'highlighted' }),
    createDiffProcessor(),
    errorLevelProcessor
  ]

  const highlighter = await getHighlighter({
    themes: hasSingleTheme ? [theme] : [theme.dark, theme.light],
    processors
  })

  const styleRE = /<pre[^>]*(style=".*?")/
  const preRE = /^<pre(.*?)>/
  const vueRE = /-vue$/
  const lineNoRE = /:(no-)?line-numbers$/
  const mustacheRE = /\{\{.*?\}\}/g

  return (str: string, lang: string, attrs: string) => {
    const vPre = vueRE.test(lang) ? '' : 'v-pre'
    lang =
      lang.replace(lineNoRE, '').replace(vueRE, '').toLowerCase() || defaultLang

    const lineOptions = attrsToLines(attrs)
    const cleanup = (str: string) =>
      str
        .replace(preRE, (_, attributes) => `<pre ${vPre}${attributes}>`)
        .replace(styleRE, (_, style) => _.replace(style, ''))

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

    if (hasSingleTheme) {
      return cleanup(
        restoreMustache(
          highlighter.codeToHtml(removeMustache(str), {
            lang,
            lineOptions,
            theme: getThemeName(theme)
          })
        )
      )
    }

    const dark = addClass(
      cleanup(
        highlighter.codeToHtml(str, {
          lang,
          lineOptions,
          theme: getThemeName(theme.dark)
        })
      ),
      'vp-code-dark',
      'pre'
    )

    const light = addClass(
      cleanup(
        highlighter.codeToHtml(str, {
          lang,
          lineOptions,
          theme: getThemeName(theme.light)
        })
      ),
      'vp-code-light',
      'pre'
    )

    return dark + light
  }
}
