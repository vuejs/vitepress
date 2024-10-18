import type MarkdownIt from 'markdown-it'

export interface Options {
  codeCopyButtonTitle: string
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
    const classes = `language-${lang}${getAdaptiveThemeMarker(
      options
    )}${active}`
    const classAttr = token.attrs && token.attrs.find((x) => x[0] === 'class')

    if (classAttr != null) {
      classAttr[1] = `${classes}  ${classAttr[1]}`
    } else {
      token.attrJoin('class', classes)
    }

    const rawCode = fence(...args)
    return (
      `<div ${md.renderer.renderAttrs(token)}>` +
      `<button title="${options.codeCopyButtonTitle}" class="copy"></button>` +
      `<span class="lang">${lang}</span>${rawCode}</div>`
    )
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
