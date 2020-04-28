import MarkdownIt from 'markdown-it'
import { MarkdownParsedData } from '../markdown'
import { deeplyParseHeader } from '../../utils/parseHeader'
import { slugify } from './slugify'

export interface Header {
  level: number
  title: string
  slug: string
}

export const extractHeaderPlugin = (
  md: MarkdownIt & { __data: MarkdownParsedData },
  include = ['h2', 'h3']
) => {
  md.renderer.rules.heading_open = (tokens, i, options, env, self) => {
    const token = tokens[i]
    if (include.includes(token.tag)) {
      const title = tokens[i + 1].content
      const idAttr = token.attrs!.find(([name]) => name === 'id')
      const slug = idAttr && idAttr[1]
      const data = md.__data
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
