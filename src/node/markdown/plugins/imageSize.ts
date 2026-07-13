// markdown-it plugin for auto adding width and height to images to avoid layout shift.

import type { MarkdownItAsync } from 'markdown-it-async'
import fs from 'node:fs'
import path from 'node:path'
import { imageSize } from 'image-size'
import { EXTERNAL_URL_RE, type MarkdownEnv } from '../../shared'

export const imageSizePlugin = (md: MarkdownItAsync, srcDir: string) => {
  const publicDir = path.resolve(srcDir, 'public')

  const imageRule = md.renderer.rules.image!
  md.renderer.rules.image = (tokens, idx, options, env: MarkdownEnv, self) => {
    const token = tokens[idx]

    const url = token.attrGet('src')
    if (!url || EXTERNAL_URL_RE.test(url)) {
      return imageRule(tokens, idx, options, env, self)
    }

    const width = token.attrGet('width')
    const height = token.attrGet('height')
    if (!width || !height) {
      const imagePath = resolveLocalImage(url, publicDir, env)
      const imageBuffer = fs.readFileSync(imagePath)
      const dimensions = imageSize(imageBuffer)

      if (!width) {
        // Scale based on existing height if set
        const newWidth = height
          ? +height * (dimensions.width / dimensions.height)
          : dimensions.width
        token.attrSet('width', newWidth.toString())
      }

      if (!height) {
        // Scale based on existing width if set
        const newHeight = width
          ? +width * (dimensions.height / dimensions.width)
          : dimensions.height
        token.attrSet('height', newHeight.toString())
      }
    }

    return imageRule(tokens, idx, options, env, self)
  }
}

function resolveLocalImage(src: string, publicDir: string, env: MarkdownEnv) {
  if (src.startsWith('/')) {
    return path.join(publicDir, src)
  } else {
    const { realPath, path: _path } = env
    const resolveDir = path.dirname(realPath ?? _path)
    return path.resolve(resolveDir, src)
  }
}
