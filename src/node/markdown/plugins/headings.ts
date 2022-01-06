import { MarkdownRenderer } from '../markdown'
import { deeplyParseHeader } from '../../utils/parseHeader'
import { slugify } from './slugify'
import MarkdownIt from 'markdown-it'

export const headingPlugin = (md: MarkdownIt, include = ['h2', 'h3']) => {
  md.renderer.rules.heading_open = (tokens, i, options, env, self) => {
    const token = tokens[i]
    if (include.includes(token.tag)) {
      const title = tokens[i + 1].content
      const idAttr = token.attrs!.find(([name]) => name === 'id')
      const slug = idAttr && idAttr[1]
      const data = (md as MarkdownRenderer).__data
      const headers = data.headers || (data.headers = [])
      headers.push({
        level: parseInt(token.tag.slice(1), 10),
        title: deeplyParseHeader(title),
        slug: slug || slugify(title)
      })
    }
    return self.renderToken(tokens, i, options)
  }
}
