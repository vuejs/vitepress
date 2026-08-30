import path from 'node:path'

import matter from 'gray-matter'
import type { MarkdownItAsync } from 'markdown-it-async'
import type { Logger } from 'vite'

import { slash, type MarkdownEnv } from '../../shared'
import { readTextFile } from '../../utils/fs'
import {
  countLineBreaks,
  LineMap,
  MappedBuilder,
  offsetSegments,
  resolveInSegments,
  sliceSegments,
  type LineMapSegment
} from '../lineMap'
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

interface Expanded {
  src: string
  /** describes `src` in its own 0-based line coordinates */
  segments: LineMapSegment[]
  /** lines of `src` stitched together from more than one source */
  splicedLines: ReadonlySet<number>
}

const noSplices: ReadonlySet<number> = new Set()

/**
 * Expands `<!-- @include: path -->` directives before rendering. Wraps
 * `renderAsync` so every consumer of the renderer (page rendering, local
 * search indexing, the content loader and `createMarkdownRenderer` users)
 * gets the same expansion. Included files are recorded in `env.includes`,
 * the expanded source is exposed as `env.src`, and `env.lineMap` maps its
 * lines back to the physical files they came from.
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
    const expanded = await processIncludes(
      md,
      srcDir,
      src,
      file,
      mdEnv!,
      options,
      logger
    )
    mdEnv!.src = expanded.src
    mdEnv!.lineMap = new LineMap(expanded.segments, expanded.splicedLines)
    return renderAsync(expanded.src, env)
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
  ancestors: string[] = [],
  base: LineMapSegment[] = [{ start: 0, file, line: 0 }]
): Promise<Expanded> {
  const matches = [...src.matchAll(includeRE)]
  if (!matches.length) return { src, segments: base, splicedLines: noSplices }

  const out = new MappedBuilder()
  let cursor = 0
  let cursorLine = 0

  const passthrough = (to: number) => {
    if (to <= cursor) return
    const text = src.slice(cursor, to)
    const breaks = countLineBreaks(text)
    out.append(text, sliceSegments(base, cursorLine, cursorLine + breaks + 1))
    cursor = to
    cursorLine += breaks
  }

  const expandInclude = async (
    m: RegExpExecArray,
    directiveLine: number
  ): Promise<Expanded | undefined> => {
    const directive = m[0]
    let m1 = m[1]

    const fail = (message: string): Expanded => {
      if (!options.silent) throw new Error(message)
      logger.warn(`${message} (in ${file})`)
      return { src: '', segments: [], splicedLines: noSplices }
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
    if (includePath === file || ancestors.includes(includePath)) {
      return undefined
    }

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
    // numbers must account for the frontmatter, so it is kept; otherwise it
    // is stripped before selecting content, and the removed height is folded
    // into the segments so they keep pointing at real editor lines
    let fmOffset = 0
    if (path.extname(includePath) === '.md' && (region || !range)) {
      const stripped = matter(content, {}).content
      fmOffset = countLineBreaks(content) - countLineBreaks(stripped)
      content = stripped
    }

    let lines = content.split('\n')
    let childBase: LineMapSegment[] = [
      { start: 0, file: includePath, line: fmOffset }
    ]

    if (region) {
      const name = region[1]
      const regions = findRegions(lines, name)
      if (regions.length > 0) {
        const selected: string[] = []
        childBase = []
        for (const r of regions) {
          childBase.push({
            start: selected.length,
            file: includePath,
            line: fmOffset + r.start
          })
          selected.push(...lines.slice(r.start, r.end))
        }
        lines = selected
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
        childBase = [
          { start: 0, file: includePath, line: fmOffset + section.start }
        ]
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
      childBase = sliceSegments(childBase, start - 1, end)
      lines = lines.slice(start - 1, end)
    }

    // recursively process includes in the content
    const child = await processIncludes(
      md,
      srcDir,
      lines.join('\n'),
      includePath,
      env,
      options,
      logger,
      [...ancestors, file],
      childBase
    )

    // wrap included markdown in blank lines so its blocks stay isolated from
    // adjacent page content; directives that are not on a line of their own -
    // inline ones and those inside fences - are left unwrapped so the blanks
    // can't end up inside surrounding constructs. The blank lines belong to
    // the include directive's own line.
    if (
      path.extname(includePath) === '.md' &&
      isOwnLine(src, m.index, directive.length) &&
      !isInsideFence(src, m.index)
    ) {
      const at = resolveInSegments(base, directiveLine)
      const childLineCount = countLineBreaks(child.src) + 1
      return {
        src: `\n\n${child.src}\n\n`,
        segments: [
          { start: 0, ...at },
          ...offsetSegments(child.segments, 2),
          { start: 2 + childLineCount, ...at }
        ],
        splicedLines: new Set([...child.splicedLines].map((l) => l + 2))
      }
    }
    return child
  }

  for (const m of matches) {
    passthrough(m.index)
    const expanded = m[1].length
      ? await expandInclude(m, cursorLine)
      : undefined
    if (expanded === undefined) {
      // left unexpanded — passes through with the surrounding text
      passthrough(m.index + m[0].length)
    } else {
      out.append(expanded.src, expanded.segments, expanded.splicedLines)
      cursor = m.index + m[0].length
      cursorLine += countLineBreaks(m[0])
    }
  }
  passthrough(src.length)

  return out.build()
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
  for (const rule of ['image', 'link_open'] as const) {
    const render =
      md.renderer.rules[rule] ??
      ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts))
    md.renderer.rules[rule] = (tokens, idx, opts, env, self) => {
      const token = tokens[idx]
      const mdEnv = env as MarkdownEnv
      const page = mdEnv.path
      const origin = mdEnv.realPath ?? mdEnv.path
      // the physical file the construct was authored in, resolved through
      // the line map — different from the page means it came from an include
      const sourceFile: string | undefined = token.meta?.vpLoc?.file
      if (page && sourceFile && sourceFile !== origin) {
        const attr = rule === 'image' ? 'src' : 'href'
        const url = token.attrGet(attr)
        // a destination resolved from `$frontmatter` belongs to the page the
        // frontmatter came from, not to the included file
        if (url?.[0] === '.' && !token.meta?.frontmatterDest) {
          const rebased = slash(
            path.join(
              path.relative(path.dirname(page), path.dirname(sourceFile)),
              url
            )
          )
          token.attrSet(attr, rebased[0] === '.' ? rebased : `./${rebased}`)
        }
      }
      return render(tokens, idx, opts, env, self)
    }
  }
}
