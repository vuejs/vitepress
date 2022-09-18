// markdown-it plugin for wrapping <pre> ... </pre>.
//
// If your plugin was chained before preWrapper, you can add additional element directly.
// If your plugin was chained after preWrapper, you can use these slots:
//   1. <!--beforebegin-->
//   2. <!--afterbegin-->
//   3. <!--beforeend-->
//   4. <!--afterend-->

import MarkdownIt from 'markdown-it'
import {
  codeGroupInternalActiveMark,
  extractCodeTitleAndLang
} from './codeGroup'

export const preWrapperPlugin = (md: MarkdownIt) => {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]
    const [codeTitle, lang] = extractCodeTitleAndLang(token)
    const isActive = token.info.includes(codeGroupInternalActiveMark)
    token.info = tokens[idx].info.replace(/\[(.+)\]/, '')
    const rawCode = fence(...args)

    return `<div class="code-block ${isActive ? 'active' : ''}">
              <div class="language-${lang}">
                <button class="copy"></button>
                <span class="code-title">${codeTitle}</span>
                ${rawCode}
              </div>
            </div>`
  }
}
