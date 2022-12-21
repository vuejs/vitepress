import MarkdownIt from 'markdown-it'
import { RenderRule } from 'markdown-it/lib/renderer'
import Token from 'markdown-it/lib/token'
import container from 'markdown-it-container'
import { nanoid } from 'nanoid'
import { extractTitle } from './preWrapper'

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
    .use(container, 'raw', {
      render: (tokens: Token[], idx: number) =>
        tokens[idx].nesting === 1 ? `<div class="vp-raw">\n` : `</div>\n`
    })
    .use(...createCodeGroup())
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
  return [
    container,
    'code-group',
    {
      render(tokens, idx) {
        if (tokens[idx].nesting === 1) {
          const name = nanoid(5)
          let tabs = ''
          let checked = 'checked="checked"'

          for (
            let i = idx + 1;
            !(
              tokens[i].nesting === -1 &&
              tokens[i].type === 'container_code-group_close'
            );
            ++i
          ) {
            if (tokens[i].type === 'fence' && tokens[i].tag === 'code') {
              const title = extractTitle(tokens[i].info)
              const id = nanoid(7)
              tabs += `<input type="radio" name="group-${name}" id="tab-${id}" ${checked}><label for="tab-${id}">${title}</label>`

              if (checked) {
                tokens[i].info += ' active'
                checked = ''
              }
            }
          }

          return `<div class="vp-code-group"><div class="tabs">${tabs}</div><div class="blocks">\n`
        }
        return `</div></div>\n`
      }
    }
  ]
}
