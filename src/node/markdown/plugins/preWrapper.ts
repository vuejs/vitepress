// markdown-it plugin for wrapping <pre> ... </pre>.
//
// If your plugin was chained before preWrapper, you can add additional element directly.
// If your plugin was chained after preWrapper, you can use these slots:
//   1. <!--beforebegin-->
//   2. <!--afterbegin-->
//   3. <!--beforeend-->
//   4. <!--afterend-->

import MarkdownIt from 'markdown-it'

export const preWrapperPlugin = (md: MarkdownIt) => {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const lang = tokens[idx].info.trim().replace(/-vue$/, '')
    const rawCode = fence(...args)
    return `<div class="language-${lang}"><button title="Copy Code" class="copy"></button><span class="lang">${
      lang === 'vue-html' ? 'template' : lang
    }</span>${rawCode}</div>`
  }
}
