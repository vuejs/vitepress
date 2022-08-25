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
  const RE = /(\w*)(?:{[\d,-]+})?\s*\[(.+)\]/
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]
    const hint = token.info.trim().replace(/-vue$/, '')
    let codeTitle = ''
    let lang = hint
    if (RE.test(hint)) {
      const matchGroup = RE.exec(hint)
      if (matchGroup && matchGroup.length == 3) {
        lang = matchGroup[1].trim()
        codeTitle = matchGroup[2]
      }
    } else {
      // Use language name as code title if not specified
      codeTitle = lang === 'vue-html' ? 'template' : lang
    }
    token.info = tokens[idx].info.replace(/\[(.+)\]/, '')
    const rawCode = fence(...args)

    return `<div class="code-block">
              <div class="language-${lang}">
                <button class="copy"></button>
                <span class="code-title">${codeTitle}</span>
                ${rawCode}
              </div>
            </div>`
  }
}
