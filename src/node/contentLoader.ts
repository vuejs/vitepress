import fs from 'fs-extra'
import matter from 'gray-matter'
import path from 'node:path'
import { glob, type GlobOptions } from 'tinyglobby'
import { normalizePath } from 'vite'
import type { SiteConfig } from './config'
import { createMarkdownRenderer } from './markdown/markdown'

export interface ContentOptions<T = ContentData[]> {
  /**
   * Include src?
   * @default false
   */
  includeSrc?: boolean

  /**
   * Render src to HTML and include in data?
   * @default false
   */
  render?: boolean

  /**
   * If `boolean`, whether to parse and include excerpt? (rendered as HTML)
   *
   * If `function`, control how the excerpt is extracted from the content.
   *
   * If `string`, define a custom separator to be used for extracting the
   * excerpt. Default separator is `---` if `excerpt` is `true`.
   *
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt_separator
   *
   * @default false
   */
  excerpt?:
    | boolean
    | ((
        file: {
          data: { [key: string]: any }
          content: string
          excerpt?: string
        },
        options?: any
      ) => void)
    | string

  /**
   * Transform the data. Note the data will be inlined as JSON in the client
   * bundle if imported from components or markdown files.
   */
  transform?: (data: ContentData[]) => T | Promise<T>

  /**
   * Options to pass to `tinyglobby`.
   * You'll need to manually specify `node_modules` and `dist` in
   * `globOptions.ignore` if you've overridden it.
   */
  globOptions?: GlobOptions
}

export interface ContentData {
  url: string
  src: string | undefined
  html: string | undefined
  frontmatter: Record<string, any>
  excerpt: string | undefined
}

/**
 * Create a loader object that can be directly used as the default export
 * of a data loader file.
 */
export function createContentLoader<T = ContentData[]>(
  /**
   * files to glob / watch - relative to srcDir
   */
  pattern: string | string[],
  {
    includeSrc,
    render,
    excerpt: renderExcerpt,
    transform,
    globOptions
  }: ContentOptions<T> = {}
): {
  watch: string | string[]
  load: () => Promise<T>
} {
  const config: SiteConfig = (global as any).VITEPRESS_CONFIG
  if (!config) {
    throw new Error(
      'content loader invoked without an active vitepress process, ' +
        'or before vitepress config is resolved.'
    )
  }

  if (typeof pattern === 'string') pattern = [pattern]
  pattern = pattern.map((p) => normalizePath(path.join(config.srcDir, p)))

  const cache = new Map<string, { data: any; timestamp: number }>()

  return {
    watch: pattern,
    async load(files?: string[]) {
      if (!files) {
        // the loader is being called directly, do a fresh glob
        files = (
          await glob(pattern, {
            ignore: ['**/node_modules/**', '**/dist/**'],
            expandDirectories: false,
            ...globOptions
          })
        ).sort()
      }

      const md = await createMarkdownRenderer(
        config.srcDir,
        config.markdown,
        config.site.base,
        config.logger
      )

      const raw: ContentData[] = []

      for (const file of files) {
        if (!file.endsWith('.md')) {
          continue
        }
        const timestamp = fs.statSync(file).mtimeMs
        const cached = cache.get(file)
        if (cached && timestamp === cached.timestamp) {
          raw.push(cached.data)
        } else {
          const src = fs.readFileSync(file, 'utf-8')
          const { data: frontmatter, excerpt } = matter(
            src,
            // @ts-expect-error gray-matter types are wrong
            typeof renderExcerpt === 'string'
              ? { excerpt_separator: renderExcerpt }
              : { excerpt: renderExcerpt }
          )
          const url =
            '/' +
            normalizePath(path.relative(config.srcDir, file))
              .replace(/(^|\/)index\.md$/, '$1')
              .replace(/\.md$/, config.cleanUrls ? '' : '.html')
          const html = render ? await md.renderAsync(src) : undefined
          const renderedExcerpt = renderExcerpt
            ? excerpt && (await md.renderAsync(excerpt))
            : undefined
          const data: ContentData = {
            src: includeSrc ? src : undefined,
            html,
            frontmatter,
            excerpt: renderedExcerpt,
            url
          }
          cache.set(file, { data, timestamp })
          raw.push(data)
        }
      }
      return (transform ? transform(raw) : raw) as any
    }
  }
}
