import type { MarkdownItAsync } from 'markdown-it-async'
import type { RuleBlock } from 'markdown-it/lib/parser_block.mjs'
import fs from 'node:fs'
import path from 'node:path'
import type { MarkdownEnv } from '../../shared'

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
  /^(.+?)(?:(#[\w-]+))?(?: ?(?:{(\d+(?:[,-]\d+)*)? ?(\S+)? ?(\S+)?}))? ?(?:\[(.+)\])?$/

export function rawPathToToken(rawPath: string) {
  const [
    ,
    filepath = '',
    region = '',
    lines = '',
    lang = '',
    attrs = '',
    rawTitle = ''
  ] = rawPathRegexp.exec(rawPath) || []

  const filename = filepath.split('/').pop() ?? ''

  const extension = filename.includes('.') ? filename.split('.').pop()! : ''

  const title = rawTitle || filename

  return { filepath, extension, region, lines, lang, attrs, title }
}

const markers = [
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

export function findRegions(lines: string[], region: string) {
  const returned: { start: number; end: number }[] = []

  let nestedCounter = 0
  let start: number | null = null

  for (let i = 0; i < lines.length; i++) {
    for (const m of markers) {
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
    (l) => !markers.some((m) => m.start.test(l) || m.end.test(l))
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

export const snippetPlugin = (
  md: MarkdownItAsync,
  srcDir: string,
  stripMarkersFromSnippets = false
) => {
  const parser: RuleBlock = (state, startLine, _endLine, silent) => {
    const CH = '<'.charCodeAt(0)
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) {
      return false
    }

    for (let i = 0; i < 3; ++i) {
      const ch = state.src.charCodeAt(pos + i)
      if (ch !== CH || pos + i >= max) return false
    }

    if (silent) {
      return true
    }

    const start = pos + 3
    const end = state.skipSpacesBack(max, pos)

    const rawPath = state.src
      .slice(start, end)
      .trim()
      .replace(/^@/, srcDir)
      .trim()

    const { filepath, extension, region, lines, lang, attrs, title } =
      rawPathToToken(rawPath)

    state.line = startLine + 1

    const token = state.push('fence', 'code', 0)
    token.info = `${lang || extension}${lines ? `{${lines}}` : ''}${
      title ? `[${title}]` : ''
    }  ${attrs ?? ''}`

    const { realPath, path: _path } = state.env as MarkdownEnv
    const resolvedPath = path.resolve(path.dirname(realPath ?? _path), filepath)

    // @ts-ignore
    token.src = [resolvedPath, region.slice(1)]
    token.markup = '```'
    token.map = [startLine, startLine + 1]

    return true
  }

  const fence = md.renderer.rules.fence!

  md.renderer.rules.fence = (...args) => {
    const [tokens, idx, , { includes }] = args
    const token = tokens[idx]
    // @ts-ignore
    const [src, region] = token.src ?? []

    if (!src) return fence(...args)

    if (includes) {
      includes.push(src)
    }

    if (!fs.existsSync(src)) {
      token.content = `Code snippet path not found: ${src}`
      token.info = ''
      return fence(...args)
    }

    if (!fs.statSync(src).isFile()) {
      token.content = `Invalid code snippet option`
      token.info = ''
      return fence(...args)
    }

    let lines = fs.readFileSync(src, 'utf8').split(/\r?\n/)

    if (region) {
      const regions = findRegions(lines, region)

      if (regions.length > 0) {
        lines = regions.flatMap((r) => lines.slice(r.start, r.end))
      } else {
        token.content = `No region #${region} found in path: ${src}`
        token.info = ''
        return fence(...args)
      }
    }

    if (stripMarkersFromSnippets) {
      lines = stripMarkers(lines)
    }

    token.content = dedent(lines).join('\n')
    return fence(...args)
  }

  md.block.ruler.before('fence', 'snippet', parser)
}
