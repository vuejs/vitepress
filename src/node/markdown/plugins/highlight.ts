import { getHighlighter } from 'shiki'
import type { ThemeOptions } from '../markdown'

export async function highlight(theme: ThemeOptions = 'material-palenight') {
  const themes = typeof theme === 'string' ? [theme] : [theme.dark, theme.light]
  const highlighter = await getHighlighter({ themes })
  const preRE = /^<pre.*?>/
  const vueRE = /-vue$/

  return (str: string, lang: string) => {
    const vPre = vueRE.test(lang) ? '' : 'v-pre'
    lang = lang.replace(vueRE, '')

    if (typeof theme === 'string') {
      return highlighter
        .codeToHtml(str, { lang, theme })
        .replace(preRE, `<pre ${vPre}>`)
    }

    const dark = highlighter
      .codeToHtml(str, { lang, theme: theme.dark })
      .replace(preRE, `<pre ${vPre} class="vp-code-dark">`)

    const light = highlighter
      .codeToHtml(str, { lang, theme: theme.light })
      .replace(preRE, `<pre ${vPre} class="vp-code-light">`)

    return dark + light
  }
}
