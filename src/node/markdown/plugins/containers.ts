import MarkdownIt from 'markdown-it'
import { RenderRule } from 'markdown-it/lib/renderer'
import Token from 'markdown-it/lib/token'
import container from 'markdown-it-container'
import {
  extractCodeTitleAndLang,
  codeGroupInternalActiveMark
} from './codeGroup'

export const containerPlugin = (md: MarkdownIt) => {
  md.use(...createContainer('tip', 'TIP', md))
    .use(...createContainer('info', 'INFO', md))
    .use(...createContainer('warning', 'WARNING', md))
    .use(...createContainer('danger', 'DANGER', md))
    .use(...createContainer('details', 'Details', md))
    // explicitly escape Vue syntax
    .use(container, 'v-pre', {
      render: (tokens: Token[], idx: number) =>
        tokens[idx].nesting === 1 ? `<div v-pre>\n` : `</div>\n`
    })
    .use(...createCodeGroup())
    .use(container, 'raw', {
      render: (tokens: Token[], idx: number) =>
        tokens[idx].nesting === 1 ? `<div class="vp-raw">\n` : `</div>\n`
    })
}

type ContainerArgs = [typeof container, string, { render: RenderRule }]

function createContainer(
  klass: string,
  defaultTitle: string,
  md: MarkdownIt
): ContainerArgs {
  return [
    container,
    klass,
    {
      render(tokens, idx) {
        const token = tokens[idx]
        const info = token.info.trim().slice(klass.length).trim()
        if (token.nesting === 1) {
          const title = md.renderInline(info || defaultTitle)
          if (klass === 'details') {
            return `<details class="${klass} custom-block"><summary>${title}</summary>\n`
          }
          return `<div class="${klass} custom-block"><p class="custom-block-title">${title}</p>\n`
        } else {
          return klass === 'details' ? `</details>\n` : `</div>\n`
        }
      }
    }
  ]
}

function createCodeGroup(): ContainerArgs {
  const klass = 'code-group'
  return [
    container,
    klass,
    {
      render(tokens, idx) {
        const token = tokens[idx]
        if (token.nesting === 1) {
          const startTokenId = idx
          const endTokenId = tokens.findIndex(
            (token) => token.type === 'container_code-group_close'
          )
          const codeGroupTokens = tokens.slice(startTokenId + 1, endTokenId)
          // Mark first code block as active
          const firstCodeBlock = codeGroupTokens.findIndex(
            (token) => token.type === 'fence' && token.tag === 'code'
          )
          tokens[startTokenId + 1 + firstCodeBlock].info +=
            codeGroupInternalActiveMark
          const codeTitles = codeGroupTokens
            .filter((token) => token.type === 'fence' && token.tag === 'code')
            .map((token) => extractCodeTitleAndLang(token)[0])
          let headerBlock = `<div class="code-group">\n<div class="tabs-header">`
          const buttonsBlock = codeTitles
            .map((title, idx) => {
              return `<button tab-index=${idx} ${
                idx === 0 ? "class='active'" : ''
              }>${title}</button>`
            })
            .join('\n')
          headerBlock += buttonsBlock
          headerBlock += `</div>\n`
          return headerBlock
        } else {
          return `</div>\n`
        }
      }
    }
  ]
}
