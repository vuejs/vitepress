import type MarkdownIt from 'markdown-it'

export interface Options {
  hasSingleTheme: boolean
}

export function preWrapperPlugin(md: MarkdownIt, options: Options) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]

    // remove title from info
    token.info = token.info.replace(/\[.*\]/, '')

    const active = / active( |$)/.test(token.info) ? ' active' : ''
    token.info = token.info.replace(/ active$/, '').replace(/ active /, ' ')

    const lang = extractLang(token.info)
    const rawCode = fence(...args)
    return `<div class="language-${lang}${getAdaptiveThemeMarker(
      options
    )}${active}"><button title="Copy Code" class="copy"></button><span class="lang">${lang}</span>${rawCode}</div>`
  }
}

export function getAdaptiveThemeMarker(options: Options) {
  return options.hasSingleTheme ? '' : ' vp-adaptive-theme'
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
