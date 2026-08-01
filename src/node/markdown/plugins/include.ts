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
  /**
   * Rewrite relative image and link urls inside included markdown files so
   * they resolve from the included file's location instead of the page
   * including it.
   * @default true
   */
  rebaseRelativeUrls?: boolean
}

const includeRE = /<!--\s*@include:\s*(.*?)\s*-->/g
const rangeRE = /\{(\d*),(\d*)\}$/
const regionRE = /#([^\s{]+)$/
const separatorRE = /[\\/]/
const fenceRE = /^ {0,3}(`{3,}|~{3,})/
const rebaseMarkerRE = /^[ \t]*<!-- @include-(?:start: (.*)|end) -->[ \t]*$/gm

// per-render stacks of included-file directories, driven by the rebase
// markers while rendering
const rebaseStacks = new WeakMap<object, string[]>()

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

  if (options.rebaseRelativeUrls !== false) registerRebaseRules(md)
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
  return replaceAsync(src, includeRE, async (...args: string[]) => {
    const [m, , rawOffset] = args
    let [, m1] = args
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

    // wrap included markdown in markers driving the url rebasing at render
    // time; they are removed from the output by the html_block rule. Blank
    // lines keep them out of adjacent html blocks, and directives that are
    // not on a line of their own - inline ones and those inside fences -
    // are left unwrapped so the markers can't end up in the output.
    const offset = rawOffset as unknown as number
    return options.rebaseRelativeUrls !== false &&
      path.extname(includePath) === '.md' &&
      isOwnLine(src, offset, m.length) &&
      !isInsideFence(src, offset)
      ? `<!-- @include-start: ${path.dirname(includePath)} -->\n\n${expanded}\n\n<!-- @include-end -->`
      : expanded
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

function isOwnLine(src: string, offset: number, length: number) {
  const before = src.lastIndexOf('\n', offset - 1) + 1
  let after = src.indexOf('\n', offset + length)
  if (after === -1) after = src.length
  return (
    !src.slice(before, offset).trim() &&
    !src.slice(offset + length, after).trim()
  )
}

function isInsideFence(src: string, offset: number) {
  let fence: string | undefined
  for (const line of src.slice(0, offset).split('\n')) {
    const marker = fenceRE.exec(line)?.[1]
    if (!marker) continue
    if (fence == null) fence = marker[0]
    else if (marker[0] === fence) fence = undefined
  }
  return fence != null
}

function registerRebaseRules(md: MarkdownItAsync) {
  const htmlBlock = md.renderer.rules.html_block!
  md.renderer.rules.html_block = (tokens, idx, opts, env, self) => {
    const token = tokens[idx]
    if (!token.content.includes('<!-- @include-')) {
      return htmlBlock(tokens, idx, opts, env, self)
    }

    // markers are emitted on their own lines, but an adjacent html block can
    // still absorb them into its token, so they are matched anywhere in the
    // content and removed from it
    token.content = token.content.replace(rebaseMarkerRE, (_, dir?: string) => {
      let stack = rebaseStacks.get(env)
      if (!stack) rebaseStacks.set(env, (stack = []))
      if (dir == null) stack.pop()
      else stack.push(dir)
      return ''
    })

    return token.content.trim() ? htmlBlock(tokens, idx, opts, env, self) : ''
  }

  for (const rule of ['image', 'link_open'] as const) {
    const render =
      md.renderer.rules[rule] ??
      ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts))
    md.renderer.rules[rule] = (tokens, idx, opts, env, self) => {
      const dir = rebaseStacks.get(env)?.at(-1)
      const file = (env as MarkdownEnv).path
      if (dir && file) {
        const token = tokens[idx]
        const attr = rule === 'image' ? 'src' : 'href'
        const url = token.attrGet(attr)
        if (url?.[0] === '.') {
          const rebased = slash(
            path.join(path.relative(path.dirname(file), dir), url)
          )
          token.attrSet(attr, rebased[0] === '.' ? rebased : `./${rebased}`)
        }
      }
      return render(tokens, idx, opts, env, self)
    }
  }
}
