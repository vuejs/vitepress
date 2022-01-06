import MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token'
import container from 'markdown-it-container'

export const containerPlugin = (md: MarkdownIt) => {
  md.use(...createContainer('tip', 'TIP'))
    .use(...createContainer('info', 'INFO'))
    .use(...createContainer('warning', 'WARNING'))
    .use(...createContainer('danger', 'WARNING'))
    .use(...createContainer('details', 'Details'))
    // explicitly escape Vue syntax
    .use(container, 'v-pre', {
      render: (tokens: Token[], idx: number) =>
        tokens[idx].nesting === 1 ? `<div v-pre>\n` : `</div>\n`
    })
}

type ContainerArgs = [
  typeof container,
  string,
  {
    render(tokens: Token[], idx: number): string
  }
]

function createContainer(klass: string, defaultTitle: string): ContainerArgs {
  return [
    container,
    klass,
    {
      render(tokens, idx) {
        const token = tokens[idx]
        const info = token.info.trim().slice(klass.length).trim()
        if (token.nesting === 1) {
          if (klass === 'details') {
            return `<details class="${klass} custom-block">${info ? `<summary>${info}</summary>` : ''}\n`
          }
          return `<div class="${klass} custom-block"><p class="custom-block-title">${
            info || defaultTitle
          }</p>\n`
        } else {
          return klass === 'details' ? `</details>\n` : `</div>\n`
        }
      }
    }
  ]
}
