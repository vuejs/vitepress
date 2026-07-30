import type { MarkdownItAsync } from 'markdown-it-async'
import type { RuleBlock } from 'markdown-it/lib/parser_block.mjs'
import fs from 'node:fs'
import path from 'node:path'
import type { MarkdownEnv } from '../../shared'

type FenceRenderer = NonNullable<MarkdownItAsync['renderer']['rules']['fence']>
type SnippetToken = ReturnType<Parameters<RuleBlock>[0]['push']> & {
  src?: [path: string, regionName: string]
}

/**
 * raw path format: "/path/to/file.extension#region {meta} [title]"
 *    where #region, {meta} and [title] are optional
 *    meta can be like '1,2,4-6 lang', 'lang' or '1,2,4-6'
 *    lang can contain special characters like C++, C#, F#, etc.
 *    path can be relative to the current file or absolute
 *    file extension is optional
 *    path can contain spaces and dots
 *
 * captures: ['/path/to/file.extension', 'extension', '#region', '{meta}', '[title]']
 */
export const rawPathRegexp =
  /^(.+?(?:(?:\.([a-z0-9]+))?))(?:(#[\w-]+))?(?: ?(?:{(\d+(?:[,-]\d+)*)? ?(\S+)? ?(\S+)?}))? ?(?:\[(.+)\])?$/

const regionMarkers = [
  {
    start: /^\s*\/\/\s*#?region\b\s*(.*?)\s*$/,
    end: /^\s*\/\/\s*#?endregion\b\s*(.*?)\s*$/
  },
  {
    start: /^\s*<!--\s*#?region\b\s*(.*?)\s*-->/,
    end: /^\s*<!--\s*#?endregion\b\s*(.*?)\s*-->/
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
    start: /^\s*#\s*#?region\b\s*(.*?)\s*$/,
    end: /^\s*#\s*#?endregion\b\s*(.*?)\s*$/
  },
  {
    start: /^\s*(?:--|::|@?REM)\s*#region\b\s*(.*?)\s*$/,
    end: /^\s*(?:--|::|@?REM)\s*#endregion\b\s*(.*?)\s*$/
  },
  {
    start: /^\s*#pragma\s+region\b\s*(.*?)\s*$/,
    end: /^\s*#pragma\s+endregion\b\s*(.*?)\s*$/
  },
  {
    start: /^\s*\(\*\s*#region\b\s*(.*?)\s*\*\)/,
    end: /^\s*\(\*\s*#endregion\b\s*(.*?)\s*\*\)/
  }
]

const snippetMarker = '<<<'

export function rawPathToToken(rawPath: string) {
  const [
    filepath = '',
    extension = '',
    region = '',
    lines = '',
    lang = '',
    attrs = '',
    rawTitle = ''
  ] = (rawPathRegexp.exec(rawPath) || []).slice(1)

  const title = rawTitle || filepath.split('/').pop() || ''

  return { filepath, extension, region, lines, lang, attrs, title }
}

export function dedent(text: string): string {
  const lines = text.split('\n')

  const minIndentLength = lines.reduce((acc, line) => {
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== ' ' && line[i] !== '\t') return Math.min(i, acc)
    }
    return acc
  }, Infinity)

  if (minIndentLength < Infinity) {
    return lines.map((x) => x.slice(minIndentLength)).join('\n')
  }

  return text
}

export function findRegion(lines: Array<string>, regionName: string) {
  let regionStart: {
    re: (typeof regionMarkers)[number]
    start: number
  } | null = null

  // find the regex pair for a start marker that matches the given region name
  for (let i = 0; i < lines.length; i++) {
    for (const marker of regionMarkers) {
      if (marker.start.exec(lines[i])?.[1] === regionName) {
        regionStart = { re: marker, start: i + 1 }
        break
      }
    }
    if (regionStart) break
  }
  if (!regionStart) return null

  let depth = 1
  // scan the rest of the lines to find the matching end marker,
  // handling nested markers with the same region name
  for (let i = regionStart.start; i < lines.length; i++) {
    // check for an inner start marker for the same region
    if (regionStart.re.start.exec(lines[i])?.[1] === regionName) {
      depth++
      continue
    }
    // check for an end marker for the same region
    const endRegion = regionStart.re.end.exec(lines[i])?.[1]
    // allow empty region name on the end marker as a fallback
    if (endRegion === regionName || endRegion === '') {
      if (--depth === 0) return { ...regionStart, end: i }
    }
  }

  return null
}

export function snippetPlugin(md: MarkdownItAsync, srcDir: string) {
  const renderFence = md.renderer.rules.fence!
  md.renderer.rules.fence = createSnippetRenderer(renderFence)
  md.block.ruler.before('fence', 'snippet', createSnippetParser(srcDir))
}

function createSnippetParser(srcDir: string): RuleBlock {
  return (state, startLine, _endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    // if it's indented more than 3 spaces, it should be a code block
    if (
      state.sCount[startLine] - state.blkIndent >= 4 ||
      pos + snippetMarker.length > max ||
      !state.src.startsWith(snippetMarker, pos)
    ) {
      return false
    }

    if (silent) return true

    const start = pos + snippetMarker.length
    const end = state.skipSpacesBack(max, pos)

    const rawPath = state.src
      .slice(start, end)
      .trim()
      .replace(/^@/, srcDir)
      .trim()

    const { filepath, extension, region, lines, lang, attrs, title } =
      rawPathToToken(rawPath)

    state.line = startLine + 1

    const token = state.push('fence', 'code', 0) as SnippetToken
    token.info = `${lang || extension}${lines ? `{${lines}}` : ''}${
      title ? `[${title}]` : ''
    }  ${attrs}`

    const { realPath, path: _path } = state.env as MarkdownEnv
    const resolvedPath = path.resolve(path.dirname(realPath ?? _path), filepath)

    token.src = [resolvedPath, region.slice(1)]
    token.markup = '```'
    token.map = [startLine, startLine + 1]

    return true
  }
}

function getFileOrError(src: string): { content: string; error?: string } {
  try {
    const content = fs.readFileSync(src, 'utf8').replace(/\r\n/g, '\n')
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

function extractRegion(content: string, regionName: string): string {
  if (!regionName) return content

  const lines = content.split('\n')
  const region = findRegion(lines, regionName)

  if (!region) return content

  return dedent(
    lines
      .slice(region.start, region.end)
      .filter((l) => !(region.re.start.test(l) || region.re.end.test(l)))
      .join('\n')
  )
}

function createSnippetRenderer(renderFence: FenceRenderer): FenceRenderer {
  return (...args) => {
    const [tokens, idx, , { includes }] = args
    const token = tokens[idx] as SnippetToken
    const [src, regionName = ''] = token.src ?? []

    if (!src) return renderFence(...args)

    includes?.push(src)

    const { content, error } = getFileOrError(src)
    if (error) {
      token.content = error
      token.info = ''
      return renderFence(...args)
    }

    token.content = extractRegion(content, regionName)
    return renderFence(...args)
  }
}
