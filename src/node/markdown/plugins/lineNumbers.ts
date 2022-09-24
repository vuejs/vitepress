// markdown-it plugin for generating line numbers.
// It depends on preWrapper plugin.

import MarkdownIt from 'markdown-it'

export const lineNumberPlugin = (
  md: MarkdownIt,
  isLineNumberOption: Boolean
) => {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const rawCode = fence(...args)
    const [tokens, idx] = args
    const token = tokens[idx]
    const attr = token.attrs && token.attrs[0]
    const info = token.info
    if (
      (!isLineNumberOption && !attr && !info) ||
      (!isLineNumberOption && attr && !attr[0].includes('showLineNumbers')) ||
      (!isLineNumberOption && info && !info.includes('showLineNumbers'))
    ) {
      return rawCode
    }
    const code = rawCode.slice(
      rawCode.indexOf('<code>'),
      rawCode.indexOf('</code>')
    )

    const lines = code.split('\n')
    const lineNumbersCode = [...Array(lines.length - 1)]
      .map((line, index) => `<span class="line-number">${index + 1}</span><br>`)
      .join('')

    const lineNumbersWrapperCode = `<div class="line-numbers-wrapper">${lineNumbersCode}</div>`

    const finalCode = rawCode
      .replace(/<\/div>$/, `${lineNumbersWrapperCode}</div>`)
      .replace(/"(language-\S*?)"/, '"$1 line-numbers-mode"')

    return finalCode
  }
}
