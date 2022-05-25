import escapeHtml from 'escape-html'
import { getHighlighter } from 'shiki'

export const highlight = async (theme = 'material-palenight') => {
  const highlighter = await getHighlighter({ theme })

  return (str: string, lang: string) => {
    if (!lang || lang === 'text') {
      return `<pre v-pre><code>${escapeHtml(str)}</code></pre>`
    }

    return highlighter.codeToHtml(str, lang).replace(/^<pre.*?>/, '<pre v-pre>')
  }
}
