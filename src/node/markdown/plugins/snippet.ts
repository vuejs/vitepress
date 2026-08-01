import type { MarkdownItAsync } from 'markdown-it-async'
import type { RuleBlock } from 'markdown-it/lib/parser_block.mjs'
import type { RenderRule } from 'markdown-it/lib/renderer.mjs'
import fs from 'node:fs'
import path from 'node:path'
import type { MarkdownEnv } from '../../shared'

export interface Options {
  /**
   * Strip all marker comments from snippets.
   * @default false
   */
  stripMarkersFromSnippets?: boolean
}

const SNIPPET_TOKEN = '<<<'

/**
 * raw path format: `/path/to/file.extension#region {meta} [title]`, where:
 * - `#region`, `{meta}`, and `[title]` are optional
 * - meta can be like `1,2,4-6 lang`, `lang` or `1,2,4-6`
 * - lang can contain special characters like `C++`, `C#`, `F#`, etc.
 * - path can be relative to the current file or absolute
 * - file extension is optional
 * - path can contain spaces and dots
 *
 * captures:
 * ```ts
 * [
 *   '/path/to/file.extension#region {1,2,4-6 lang other=attrs} [title]',
 *   '/path/to/file.extension',
 *   'region',
 *   '1,2,4-6',
 *   'lang',
 *   'other=attrs',
 *   'title',
 * ]
 * ```
 */
const RAW_PATH_RE =
  /^(.+?)(?:#([\w-]+))?(?: ?(?:{(\d+(?:[,-]\d+)*)? ?(\S+)? ?(\S+)?}))? ?(?:\[(.+)\])?$/

const MIGHT_BE_MARKER_RE = /region/i
const MARKER_RES = [
  {
    start: /^\s*\/\/\s*#region\b\s*(.*?)\s*$/,
    end: /^\s*\/\/\s*#endregion\b\s*(.*?)\s*$/
  },
  {
    start: /^\s*<!--\s*#region\b\s*(.*?)\s*-->/,
    end: /^\s*<!--\s*#endregion\b\s*(.*?)\s*-->/
  },
  {
    start: /^\s*\/\*\s*#region\b\s*(.*?)\s*\*\//,
    end: /^\s*\/\*\s*#endregion\b\s*(.*?)\s*\*\//
  },
  {
    start: /^\s*#[rR]egion\b\s*(.*?)\s*$/,
    end: /^\s*#[eE]nd ?[rR]egion\b\s*(.*?)\s*$/
  },
  {
    start: /^\s*#\s+region\b\s*(.*?)\s*$/,
    end: /^\s*#\s+endregion\b\s*(.*?)\s*$/
  },
  {
    start: /^\s*(?:--|::|(?:@\s*)?[rR][eE][mM]\s)\s*#region\b\s*(.*?)\s*$/,
    end: /^\s*(?:--|::|(?:@\s*)?[rR][eE][mM]\s)\s*#endregion\b\s*(.*?)\s*$/
  },
  {
    start: /^\s*#pragma\s+region\b\s*(.*?)\s*$/,
    end: /^\s*#pragma\s+endregion\b\s*(.*?)\s*$/
  },
  {
    start: /^\s*\(\*\s*#region\b\s*(.*?)\s*\*\)/,
    end: /^\s*\(\*\s*#endregion\b\s*(.*?)\s*\*\)/
  },
  {
    start: /^\s*"[/][/]+\s*#region\b\s*(.*?)":\s*"",?$/,
    end: /^\s*"[/][/]+\s*#endregion\b\s*(.*?)":\s*"",?$/
  }
]

export function rawPathToToken(rawPath: string) {
  const [
    ,
    filepath = '',
    region = '',
    lines = '',
    lang = '',
    attrs = '',
    rawTitle = ''
  ] = RAW_PATH_RE.exec(rawPath) || []

  const filename = filepath.split('/').pop() ?? ''

  const extension = filename.includes('.') ? filename.split('.').pop()! : ''

  const title = rawTitle || filename

  return { filepath, extension, region, lines, lang, attrs, title }
}

export function findRegions(lines: string[], region: string) {
  const returned: { start: number; end: number }[] = []

  let nestedCounter = 0
  let start: number | null = null

  for (let i = 0; i < lines.length; i++) {
    if (!MIGHT_BE_MARKER_RE.test(lines[i])) continue

    for (const m of MARKER_RES) {
      // find region start
      const startMatch = m.start.exec(lines[i])
      if (startMatch?.[1] === region) {
        if (nestedCounter === 0) start = i + 1
        nestedCounter++
        break
      }

      if (nestedCounter === 0) continue

      // find region end
      const endMatch = m.end.exec(lines[i])
      if (endMatch?.[1] === region || endMatch?.[1] === '') {
        nestedCounter--
        // if all nested regions ended
        if (nestedCounter === 0 && start != null) {
          returned.push({ start, end: i })
          start = null
        }
        break
      }
    }
  }

  return returned
}

export function stripMarkers(lines: string[]): string[] {
  return lines.filter(
    (l) =>
      !MIGHT_BE_MARKER_RE.test(l) ||
      !MARKER_RES.some((m) => m.start.test(l) || m.end.test(l))
  )
}

export function dedent(lines: string[]): string[] {
  const minIndentLength = lines.reduce((acc, line) => {
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== ' ' && line[i] !== '\t') return Math.min(i, acc)
    }
    return acc
  }, Infinity)

  if (minIndentLength < Infinity) {
    return lines.map((x) => x.slice(minIndentLength))
  }

  return lines
}

function getFileOrError(src: string): { content: string; error?: string } {
  try {
    const content = fs.readFileSync(src, 'utf8').replaceAll(/\r/g, '')
    return { content }
  } catch (error) {
    switch ((error as NodeJS.ErrnoException).code) {
      case 'ENOENT':
        return { content: '', error: `Code snippet path not found: ${src}` }
      case 'EISDIR':
        return { content: '', error: 'Invalid code snippet option' }
      default:
        throw error
    }
  }
}

function createSnippetRenderer(
  renderFence: RenderRule,
  options?: Options
): RenderRule {
  return (...args) => {
    const [tokens, idx, , { includes }] = args
    const token = tokens[idx]
    const { src, region } = token.meta ?? {}

    if (!src) return renderFence(...args)

    includes?.push(src)

    const { content, error } = getFileOrError(src)
    if (error) {
      token.content = error
      token.info = ''
      return renderFence(...args)
    }

    let lines = content.split('\n')

    if (region) {
      const regions = findRegions(lines, region)

      if (regions.length === 0) {
        token.content = `No region #${region} found in path: ${src}`
        token.info = ''
        return renderFence(...args)
      }

      lines = regions.flatMap((r) => lines.slice(r.start, r.end))
    }

    if (options?.stripMarkersFromSnippets) {
      lines = stripMarkers(lines)
    }

    token.content = dedent(lines).join('\n')
    return renderFence(...args)
  }
}

function createSnippetParser(srcDir: string): RuleBlock {
  return (state, startLine, _endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    // if it's indented more than 3 spaces, it should be a code block
    if (
      state.sCount[startLine] - state.blkIndent >= 4 ||
      pos + SNIPPET_TOKEN.length > max ||
      !state.src.startsWith(SNIPPET_TOKEN, pos)
    ) {
      return false
    }

    if (silent) return true

    const start = pos + SNIPPET_TOKEN.length
    const end = state.skipSpacesBack(max, pos)

    const rawPath = state.src.slice(start, end).trim().replace(/^@/, srcDir)

    const { filepath, extension, region, lines, lang, attrs, title } =
      rawPathToToken(rawPath)

    state.line = startLine + 1

    const token = state.push('fence', 'code', 0)
    token.info =
      (lang || extension) +
      (lines ? `{${lines}}` : '') +
      (title ? `[${title}]` : '') +
      (' ' + attrs)

    const { realPath, path: _path } = state.env as MarkdownEnv
    const src = path.resolve(path.dirname(realPath ?? _path), filepath)

    token.meta = { src, region }
    token.markup = '```'
    token.map = [startLine, startLine + 1]

    return true
  }
}

export function snippetPlugin(
  md: MarkdownItAsync,
  srcDir: string,
  options?: Options
) {
  const renderFence = md.renderer.rules.fence!
  md.renderer.rules.fence = createSnippetRenderer(renderFence, options)
  md.block.ruler.before('fence', 'snippet', createSnippetParser(srcDir))
}
