import type { MarkdownItAsync } from 'markdown-it-async'
import type Token from 'markdown-it/lib/token.mjs'

export interface Options {
  codeCopyButtonTitle: string
  languageLabel?: Record<string, string>
}

export function preWrapperPlugin(md: MarkdownItAsync, options: Options) {
  const langLabel = Object.fromEntries(
    Object.entries(options.languageLabel || {}) //
      .map(([k, v]) => [k.toLowerCase(), v])
  )

  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]

    // @ts-ignore
    const isFromSnippet = !!token.src
    const title =
      isFromSnippet || isInCodeGroup(tokens, idx)
        ? ''
        : extractTitle(token.info)
    token.info = token.info.replace(/\[.*\]/, '')

    const active = / active( |$)/.test(token.info) ? ' active' : ''
    token.info = token.info.replace(/ active$/, '').replace(/ active /, ' ')

    const lang = extractLang(token.info)
    const label = langLabel[lang.toLowerCase()] || lang.replace(/_/g, ' ')

    return (
      `<div class="language-${lang}${active}">` +
      (title
        ? `<div class="title-bar">` +
          `<span class="title-text" data-title="${md.utils.escapeHtml(title)}">${title}</span>` +
          `</div>`
        : '') +
      `<button title="${options.codeCopyButtonTitle}" class="copy"></button>` +
      `<span class="lang">${label}</span>` +
      fence(...args) +
      `</div>`
    )
  }
}

export interface ExtractTitleOptions {
  html?: boolean
  fallbackToLang?: boolean
}

export function extractTitle(info: string, options?: ExtractTitleOptions) {
  if (options?.html) {
    return (
      info.replace(/<!--[^]*?-->/g, '').match(/data-title="(.*?)"/)?.[1] || ''
    )
  }
  return (
    info.match(/\[(.*)\]/)?.[1] ||
    (options?.fallbackToLang ? extractLang(info) || 'txt' : '')
  )
}

function extractLang(info: string): string {
  return (
    /^[a-zA-Z0-9-_]+/
      .exec(info)?.[0]
      .replace(/-vue$/, '') // remove -vue suffix
      .replace(/^vue-html$/, 'template')
      .replace(/^ansi$/, '') || ''
  )
}

/**
 * Whether the `idx` within `tokens` is inside a code-group container
 */
function isInCodeGroup(tokens: Token[], idx: number): boolean {
  for (let i = idx - 1; i >= 0; --i) {
    if (tokens[i].type === 'container_code-group_open') {
      return true
    }
    if (tokens[i].type === 'container_code-group_close') {
      return false
    }
  }
  return false
}
