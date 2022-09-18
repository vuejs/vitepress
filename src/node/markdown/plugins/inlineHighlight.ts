import MarkdownIt from 'markdown-it'

export const inlineHighlightPlugin = (md: MarkdownIt) => {
  const codeRender = md.renderer.rules.code_inline!
  md.renderer.rules.code_inline = (...args) => {
    const [tokens, idx, options] = args
    const token = tokens[idx]
    if (token.attrs == null) {
      return codeRender(...args)
    } else {
      const lang = token.attrs[0][0]
      if (options.highlight) {
        const htmlStr = options.highlight(token.content, lang, '')
        return htmlStr.match(/(<code>.*<\/code>)/)![0]
      } else {
        return codeRender(...args)
      }
    }
  }
}
