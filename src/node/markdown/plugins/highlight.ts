import { IThemeRegistration, getHighlighter } from 'shiki'
import type { ThemeOptions } from '../markdown'

export async function highlight(theme: ThemeOptions = 'material-palenight') {
  const hasSingleTheme = typeof theme === 'string' || 'name' in theme
  const getThemeName = (themeValue: IThemeRegistration) =>
    typeof themeValue === 'string' ? themeValue : themeValue.name

  const highlighter = await getHighlighter({
    themes: hasSingleTheme ? [theme] : [theme.dark, theme.light]
  })
  const preRE = /^<pre.*?>/

  return (str: string, lang: string) => {
    lang = lang || 'text'

    if (hasSingleTheme) {
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
