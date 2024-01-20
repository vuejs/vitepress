import type MarkdownIt from 'markdown-it'
import type { ContainerOptions } from './containers'

export const gitHubAlertsPlugin = (
  md: MarkdownIt, 
  options?: ContainerOptions
) => {
  const markers = ['TIP', 'NOTE', 'INFO', 'IMPORTANT', 'WARNING', 'CAUTION', 'DANGER']
  const matchCaseSensitive = true
  const titleMark = {
    tip: options?.tipLabel || 'TIP',
    note: options?.noteLabel || 'NOTE',
    info: options?.infoLabel || 'INFO',
    important: options?.importantLabel || 'IMPORTANT',
    warning: options?.warningLabel || 'WARNING',
    caution: options?.cautionLabel || 'CAUTION',
    danger: options?.dangerLabel || 'DANGER',
  } as Record<string, string>

  const markerNameRE =  markers.join('|')
  const RE = new RegExp(`^\\[\\!(${markerNameRE})\\]([^\\n\\r]*)`, matchCaseSensitive ? '' : 'i')

  md.core.ruler.after('block', 'github-alerts', (state) => {
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'blockquote_open') {
        const open = tokens[i]
        const startIndex = i
        while (tokens[i]?.type !== 'blockquote_close' && i <= tokens.length)
          i += 1
        const close = tokens[i]
        const endIndex = i
        const firstContent = tokens.slice(startIndex, endIndex + 1).find(token => token.type === 'inline')
        if (!firstContent)
          continue
        const match = firstContent.content.match(RE)
        if (!match)
          continue
        const type = match[1].toLowerCase()
        const title = match[2].trim() || titleMark[type] || capitalize(type)
        firstContent.content = firstContent.content.slice(match[0].length).trimStart()
        open.type = 'github_alert_open'
        open.tag = 'div'
        open.meta = {
          title,
          type,
        }
        close.type = 'github_alert_close'
        close.tag = 'div'
      }
    }
  })
  md.renderer.rules.github_alert_open = function (tokens, idx) {
    const { title, type } = tokens[idx].meta
    const attrs = ''
    return `<div class="${type} custom-block github-alert"${attrs}><p class="custom-block-title">${title}</p>\n`
  }
}


function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
