import type { MarkdownItAsync } from 'markdown-it-async'

export interface Options {
  codeCopyButtonTitle: string
  languageLabel?: Record<string, string>
}

export function preWrapperPlugin(md: MarkdownItAsync, options: Options) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]

    // remove title from info
    token.info = token.info.replace(/\[.*\]/, '')

    const active = / active( |$)/.test(token.info) ? ' active' : ''
    token.info = token.info.replace(/ active$/, '').replace(/ active /, ' ')

    const lang = extractLang(token.info)
    const langLabel = getLangLabel(lang, options.languageLabel)

    return (
      `<div class="language-${lang}${active}">` +
      `<button title="${options.codeCopyButtonTitle}" class="copy"></button>` +
      `<span class="lang">${langLabel}</span>` +
      fence(...args) +
      '</div>'
    )
  }
}

export function extractTitle(info: string, html = false) {
  if (html) {
    return (
      info.replace(/<!--[^]*?-->/g, '').match(/data-title="(.*?)"/)?.[1] || ''
    )
  }
  return info.match(/\[(.*)\]/)?.[1] || extractLang(info) || 'txt'
}

function extractLang(info: string) {
  return info
    .trim()
    .replace(/=(\d*)/, '')
    .replace(/:(no-)?line-numbers({| |$|=\d*).*/, '')
    .replace(/(-vue|{| ).*$/, '')
    .replace(/^vue-html$/, 'template')
    .replace(/^ansi$/, '')
}

function getLangLabel(lang: string, languageLabel?: Record<string, string>): string {
  if (languageLabel && languageLabel[lang]) {
    return languageLabel[lang]
  }

  return lang.replace(/_/g, ' ')
}
