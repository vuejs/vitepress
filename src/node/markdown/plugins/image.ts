// markdown-it plugin for normalizing image source and auto adding
// width and height to images to avoid layout shift.

import type { MarkdownItAsync } from 'markdown-it-async'
import type Token from 'markdown-it/lib/token.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { imageSize } from 'image-size'
import { EXTERNAL_URL_RE, type MarkdownEnv } from '../../shared'

export interface Options {
  /**
   * Support native lazy loading for the `<img>` tag.
   * @default false
   */
  lazyLoading?: boolean
}

export const imagePlugin = (
  md: MarkdownItAsync,
  publicDir: string,
  { lazyLoading }: Options = {}
) => {
  const imageRule = md.renderer.rules.image!
  md.renderer.rules.image = (tokens, idx, options, env: MarkdownEnv, self) => {
    const token = tokens[idx]

    let url = token.attrGet('src')

    if (url && !EXTERNAL_URL_RE.test(url)) {
      // Normalize relative "foo.png" to "./foo.png" and decode for
      // processing by bundlers.
      if (!/^\.*?\//.test(url)) {
        url = './' + url
      }

      url = decodeURIComponent(url)
      token.attrSet('src', url)

      addImageDimensions(token, url, publicDir, env)
    }

    if (lazyLoading && !token.attrGet('loading')) {
      token.attrSet('loading', 'lazy')
    }

    return imageRule(tokens, idx, options, env, self)
  }
}

/**
 * Adds width/height attributes based on the intrinsic image dimensions to
 * avoid layout shift. If only one of the two is specified by the user, the
 * other is scaled proportionally to it.
 */
function addImageDimensions(
  token: Token,
  url: string,
  publicDir: string,
  env: MarkdownEnv
) {
  const width = token.attrGet('width')
  const height = token.attrGet('height')
  if (width && height) return

  const dimensions = getImageDimensions(url, publicDir, env)
  if (!dimensions) return

  const aspectRatio = dimensions.width / dimensions.height

  if (!width) {
    const newWidth = height ? +height * aspectRatio : dimensions.width
    if (Number.isFinite(newWidth)) {
      token.attrSet('width', Math.round(newWidth).toString())
    }
  }

  if (!height) {
    const newHeight = width ? +width / aspectRatio : dimensions.height
    if (Number.isFinite(newHeight)) {
      token.attrSet('height', Math.round(newHeight).toString())
    }
  }
}

function getImageDimensions(url: string, publicDir: string, env: MarkdownEnv) {
  try {
    const imagePath = resolveLocalImage(url, publicDir, env)
    return imagePath ? imageSize(fs.readFileSync(imagePath)) : undefined
  } catch {
    // Best-effort: may fail if the env has no file path, the file doesn't
    // exist, or `image-size` doesn't support the image format.
    return
  }
}

function resolveLocalImage(src: string, publicDir: string, env: MarkdownEnv) {
  if (src.startsWith('/')) {
    // an empty publicDir means it's disabled
    return publicDir ? path.join(publicDir, src) : undefined
  }
  const { realPath, path: _path } = env
  return path.resolve(path.dirname(realPath ?? _path), src)
}
