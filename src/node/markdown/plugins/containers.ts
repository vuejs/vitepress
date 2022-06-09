import MarkdownIt from 'markdown-it'
import { RenderRule } from 'markdown-it/lib/renderer'
import Token from 'markdown-it/lib/token'
import container from 'markdown-it-container'

export const containerPlugin = (md: MarkdownIt) => {
  md.use(...createContainer('tip', 'TIP'))
    .use(...createContainer('info', 'INFO'))
    .use(...createContainer('warning', 'WARNING'))
    .use(...createContainer('danger', 'DANGER'))
    .use(...createContainer('details', 'Details'))
    // explicitly escape Vue syntax
    .use(container, 'v-pre', {
      render: (tokens: Token[], idx: number) =>
        tokens[idx].nesting === 1 ? `<div v-pre>\n` : `</div>\n`
    })
}

type ContainerArgs = [typeof container, string, { render: RenderRule }]

function createContainer(klass: string, defaultTitle: string): ContainerArgs {
  return [
    container,
    klass,
    {
      render(tokens, idx, options, env) {
        const md = new MarkdownIt().set(options)
        const token = tokens[idx]
        const info = token.info.trim().slice(klass.length).trim()
        if (token.nesting === 1) {
          const title = md.renderInline(info || defaultTitle, env)
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
