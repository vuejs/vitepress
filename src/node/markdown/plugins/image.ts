// markdown-it plugin for normalizing image source

import type MarkdownIt from 'markdown-it'
import { EXTERNAL_URL_RE } from '../../shared'

export interface Options {
  /**
   * Support native lazy loading for the `<img>` tag.
   * @default false
   */
  lazyLoading?: boolean
}

export const imagePlugin = (md: MarkdownIt, { lazyLoading }: Options = {}) => {
  const imageRule = md.renderer.rules.image!
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    let url = token.attrGet('src')
    if (url && !EXTERNAL_URL_RE.test(url)) {
      if (!/^\.?\//.test(url)) url = './' + url
      token.attrSet('src', decodeURIComponent(url))
    }
    if (lazyLoading) {
      token.attrSet('loading', 'lazy')
    }
    return imageRule(tokens, idx, options, env, self)
  }
}
