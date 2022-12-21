import MarkdownIt from 'markdown-it'

export function preWrapperPlugin(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const { info } = args[0][args[1]]
    const lang = extractLang(info)
    const rawCode = fence(...args)
    return `<div class="language-${lang}${
      / active( |$)/.test(info) ? ' active' : ''
    }"><button title="Copy Code" class="copy"></button><span class="lang">${lang}</span>${rawCode}</div>`
  }
}

export function extractTitle(info: string) {
  return info.match(/\[(.*)\]/)?.[1] || extractLang(info) || 'txt'
}

const extractLang = (info: string) => {
  return info
    .trim()
    .replace(/(-vue|{| ).*$/, '')
    .replace(/^vue-html$/, 'template')
}
