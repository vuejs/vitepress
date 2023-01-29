import type { MarkdownSfcBlocks } from '@mdit-vue/plugin-sfc'
import type { Header } from '../shared'

// Manually declaring all properties as rollup-plugin-dts
// is unable to merge augmented module declarations

export interface MarkdownEnv {
  /**
   * The raw Markdown content without frontmatter
   */
  content?: string
  /**
   * The excerpt that extracted by `@mdit-vue/plugin-frontmatter`
   *
   * - Would be the rendered HTML when `renderExcerpt` is enabled
   * - Would be the raw Markdown when `renderExcerpt` is disabled
   */
  excerpt?: string
  /**
   * The frontmatter that extracted by `@mdit-vue/plugin-frontmatter`
   */
  frontmatter?: Record<string, unknown>
  /**
   * The headers that extracted by `@mdit-vue/plugin-headers`
   */
  headers?: Header[]
  /**
   * SFC blocks that extracted by `@mdit-vue/plugin-sfc`
   */
  sfcBlocks?: MarkdownSfcBlocks
  /**
   * The title that extracted by `@mdit-vue/plugin-title`
   */
  title?: string
  path: string
  relativePath: string
  cleanUrls: boolean
  links?: string[]
}
