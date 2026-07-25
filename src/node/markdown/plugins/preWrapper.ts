import type { MarkdownItAsync } from 'markdown-it-async'
import type { MarkdownEnv, MarkdownLocaleOptions } from '../../shared'

export interface Options {
  codeCopyButton: { tooltipText: string; copiedText: string }
  languageLabel?: Record<string, string>
  /**
   * Per-locale overrides for the copy button strings, keyed by locale index.
   */
  locales?: Record<string, MarkdownLocaleOptions | undefined>
}

export function preWrapperPlugin(md: MarkdownItAsync, options: Options) {
  const langLabel = Object.fromEntries(
    Object.entries(options.languageLabel || {}) //
      .map(([k, v]) => [k.toLowerCase(), v])
  )

  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx, , env] = args
    const token = tokens[idx]

    // remove title from info
    token.info = token.info.replace(/\[.*\]/, '')

    const active = / active( |$)/.test(token.info) ? ' active' : ''
    token.info = token.info.replace(/ active$/, '').replace(/ active /, ' ')

    const lang = extractLang(token.info)
    const label = langLabel[lang.toLowerCase()] || lang.replace(/_/g, ' ')

    const { localeIndex } = (env ?? {}) as MarkdownEnv
    const localeButton = localeIndex
      ? options.locales?.[localeIndex]?.codeCopyButton
      : undefined
    const tooltipText =
      localeButton?.tooltipText || options.codeCopyButton.tooltipText
    // rendered by the theme via `content: attr(data-copied)`
    const copiedText =
      localeButton?.copiedText || options.codeCopyButton.copiedText

    return (
      `<div class="language-${lang}${active}">` +
      `<button title="${tooltipText}" data-copied="${copiedText}" class="copy"></button>` +
      `<span class="lang">${label}</span>` +
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

function extractLang(info: string): string {
  return (
    /^[a-zA-Z0-9-_]+/
      .exec(info)?.[0]
      .replace(/-vue$/, '') // remove -vue suffix
      .replace(/^vue-html$/, 'template')
      .replace(/^ansi$/, '') || ''
  )
}
