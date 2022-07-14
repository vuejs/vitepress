import { getHighlighter } from 'shiki'
import type { ThemeOptions, ThemeValue } from '../markdown'

export async function highlight(theme: ThemeOptions = 'material-palenight') {
  const hasMultipleThemes =
    typeof theme !== 'string' && 'dark' in theme && 'light' in theme
  const themes: ThemeValue[] = hasMultipleThemes
    ? [theme.dark, theme.light]
    : [theme]
  const highlighter = await getHighlighter({ themes })
  const preRE = /^<pre.*?>/

  return (str: string, lang: string) => {
    lang = lang || 'text'

    const getThemeName = (themeValue: ThemeValue) =>
      typeof themeValue === 'string' ? themeValue : themeValue.name

    if (!hasMultipleThemes) {
      return highlighter
        .codeToHtml(str, { lang, theme: getThemeName(theme) })
        .replace(preRE, '<pre v-pre>')
    }

    const dark = highlighter
      .codeToHtml(str, { lang, theme: getThemeName(theme.dark) })
      .replace(preRE, '<pre v-pre class="vp-code-dark">')

    const light = highlighter
      .codeToHtml(str, { lang, theme: getThemeName(theme.light) })
      .replace(preRE, '<pre v-pre class="vp-code-light">')

    return dark + light
  }
}
