import type { MarkdownItEnv } from '@mdit-vue/types'
import { CleanUrlsMode } from '../shared'

export interface MarkdownEnv extends MarkdownItEnv {
  path: string
  relativePath: string
  cleanUrls: CleanUrlsMode
  links?: string[]
}
