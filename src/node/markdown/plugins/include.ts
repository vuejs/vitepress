import matter from 'gray-matter'
import { replaceAsync, type MarkdownItAsync } from 'markdown-it-async'
import path from 'node:path'
import type { Logger } from 'vite'
import { slash, type MarkdownEnv } from '../../shared'
import { readTextFile } from '../../utils/fs'
import { findRegions } from '../regions'

export interface Options {
  /**
   * Log a warning and expand to nothing when the included file, region,
   * heading or range is missing, instead of throwing.
   * @default false
   */
  silent?: boolean
}

const includeRE = /<!--\s*@include:\s*(.*?)\s*-->/g
const rangeRE = /\{(\d*),(\d*)\}$/
const regionRE = /#([^\s{]+)$/
const separatorRE = /[\\/]/

/**
 * Expands `<!-- @include: path -->` directives before rendering. Wraps
 * `renderAsync` so every consumer of the renderer (page rendering, local
 * search indexing, the content loader and `createMarkdownRenderer` users)
 * gets the same expansion. Included files are recorded in `env.includes`
 * and the expanded source is exposed as `env.src`.
 */
export function includePlugin(
  md: MarkdownItAsync,
  srcDir: string,
  options: Options = {},
  logger: Pick<Logger, 'warn'> = console
) {
  const renderAsync = md.renderAsync.bind(md)
  md.renderAsync = async (src, env?) => {
    const mdEnv = env as MarkdownEnv | undefined
    const file = mdEnv?.realPath ?? mdEnv?.path
    if (file == null) return renderAsync(src, env)

    mdEnv!.includes ??= []
    src = await processIncludes(md, srcDir, src, file, mdEnv!, options, logger)
    mdEnv!.src = src
    return renderAsync(src, env)
  }
}

async function processIncludes(
  md: MarkdownItAsync,
  srcDir: string,
  src: string,
  file: string,
  env: MarkdownEnv,
  options: Options,
  logger: Pick<Logger, 'warn'>,
  ancestors: string[] = []
): Promise<string> {
  return replaceAsync(src, includeRE, async (m: string, m1: string) => {
    if (!m1.length) return m

    const fail = (message: string): string => {
      if (!options.silent) throw new Error(message)
      logger.warn(`${message} (in ${file})`)
      return ''
    }

    const range = rangeRE.exec(m1)
    if (range) m1 = m1.slice(0, range.index)
    const region = regionRE.exec(m1)
    if (region) m1 = m1.slice(0, region.index)

    const includePath = m1.startsWith('@')
      ? path.join(srcDir, m1.slice(separatorRE.test(m1[1]) ? 2 : 1))
      : path.join(path.dirname(file), m1)

    // leave circular includes unexpanded — only repeats along the ancestor
    // chain are cycles, the same file may still be included by siblings
    if (includePath === file || ancestors.includes(includePath)) return m

    // record the dependency before reading it, so that creating a missing
    // file is picked up by the watcher
    env.includes!.push(slash(includePath))

    let content: string
    try {
      content = await readTextFile(includePath)
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code === 'ENOENT') {
        return fail(`Include file not found: ${includePath}`)
      }
      if (code === 'EISDIR') {
        return fail(`Include path is a directory: ${includePath}`)
      }
      throw error
    }

    // for markdown files, if a range is used without a region, the line
    // numbers must account for the frontmatter, so it is kept; otherwise
    // it is stripped before selecting content
    if (path.extname(includePath) === '.md' && (region || !range)) {
      content = matter(content, {}).content
    }

    let lines = content.split('\n')

    if (region) {
      const name = region[1]
      const regions = findRegions(lines, name)
      if (regions.length > 0) {
        lines = regions.flatMap((r) => lines.slice(r.start, r.end))
      } else {
        // no editor-style region matched — try heading anchors
        const section = findHeadingSection(md, content, includePath, name, {
          srcDir,
          cleanUrls: env.cleanUrls
        })
        if (!section) {
          return fail(
            `Include region or heading "${name}" not found in ${includePath}`
          )
        }
        lines = lines.slice(section.start, section.end)
      }
    }

    if (range) {
      const start = range[1] ? parseInt(range[1]) : 1
      const end = range[2] ? parseInt(range[2]) : lines.length
      if (start < 1 || end < start || end > lines.length) {
        return fail(
          `Include range ${range[0]} is out of bounds in ${includePath}`
        )
      }
      lines = lines.slice(start - 1, end)
    }

    // recursively process includes in the content
    const expanded = await processIncludes(
      md,
      srcDir,
      lines.join('\n'),
      includePath,
      env,
      options,
      logger,
      [...ancestors, file]
    )

    return expanded
  })
}

function findHeadingSection(
  md: MarkdownItAsync,
  content: string,
  includePath: string,
  anchor: string,
  { srcDir, cleanUrls }: { srcDir: string; cleanUrls: boolean }
) {
  const headings = md
    .parse(content, {
      path: includePath,
      relativePath: slash(path.relative(srcDir, includePath)),
      cleanUrls
    } satisfies MarkdownEnv)
    .filter((t) => t.type === 'heading_open' && t.map)

  const idx = headings.findIndex((t) => t.attrGet('id') === anchor)
  const heading = headings[idx]
  if (!heading) return null

  // the section spans from below the heading to the next heading of the
  // same or a higher level, or to the end of the file
  let end: number | undefined
  const level = parseInt(heading.tag.slice(1))
  for (let i = idx + 1; i < headings.length; i++) {
    if (parseInt(headings[i].tag.slice(1)) <= level) {
      end = headings[i].map![0]
      break
    }
  }

  return { start: heading.map![1], end }
}
