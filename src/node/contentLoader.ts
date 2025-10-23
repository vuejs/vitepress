import fs from 'fs-extra'
import matter from 'gray-matter'
import path from 'node:path'
import pMap from 'p-map'
import { normalizePath } from 'vite'
import type { SiteConfig } from './config'
import { createMarkdownRenderer } from './markdown/markdown'
import type { Awaitable } from './shared'
import { glob, normalizeGlob, type GlobOptions } from './utils/glob'

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
  transform?: (data: ContentData[]) => Awaitable<T>

  /**
   * Options to pass to `tinyglobby` and `picomatch` for globbing.
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
  watch: string | string[],
  options: ContentOptions<T> = {}
) {
  const config: SiteConfig = (global as any).VITEPRESS_CONFIG
  if (!config) {
    throw new Error(
      'content loader invoked without an active vitepress process, ' +
        'or before vitepress config is resolved.'
    )
  }

  const cache = new Map<string, { data: any; timestamp: number }>()

  watch = normalizeGlob(watch, config.srcDir)

  return {
    watch,
    options: { globOptions: options.globOptions },

    async load(files?: string[]) {
      // the loader is being called directly, do a fresh glob
      files ??= await glob(watch, {
        absolute: true,
        ...options.globOptions
      })

      const md = await createMarkdownRenderer(
        config.srcDir,
        config.markdown,
        config.site.base,
        config.logger
      )

      const raw = await pMap(
        files,
        async (file) => {
          if (!file.endsWith('.md')) return null

          const timestamp = fs.statSync(file).mtimeMs
          const cached = cache.get(file)

          if (cached && timestamp === cached.timestamp) return cached.data

          const src = fs.readFileSync(file, 'utf-8')

          const renderExcerpt = options.excerpt
          const { data: frontmatter, excerpt } = matter(
            src,
            typeof renderExcerpt === 'string'
              ? { excerpt_separator: renderExcerpt }
              : { excerpt: renderExcerpt as any } // gray-matter types are wrong
          )

          const url =
            '/' +
            normalizePath(path.relative(config.srcDir, file))
              .replace(/(^|\/)index\.md$/, '$1')
              .replace(/\.md$/, config.cleanUrls ? '' : '.html')

          const html = options.render ? await md.renderAsync(src) : undefined
          const renderedExcerpt = renderExcerpt
            ? excerpt && (await md.renderAsync(excerpt))
            : undefined

          const data: ContentData = {
            src: options.includeSrc ? src : undefined,
            html,
            frontmatter,
            excerpt: renderedExcerpt,
            url
          }

          cache.set(file, { data, timestamp })
          return data
        },
        { concurrency: config.buildConcurrency }
      )

      const filtered = raw.filter((i) => i !== null)
      return options.transform?.(filtered) ?? (filtered as T)
    }
  }
}
