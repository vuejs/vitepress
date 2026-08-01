import type { MarkdownItAsync } from 'markdown-it-async'
import type { RuleBlock } from 'markdown-it/lib/parser_block.mjs'
import path from 'node:path'
import type { Logger } from 'vite'
import type { MarkdownEnv } from '../../shared'
import { readTextFileSync } from '../../utils/fs'
import {
  dedent,
  findRegions,
  stripRegionMarkers,
  type RegionMarker
} from '../regions'

export interface Options {
  /**
   * Log a warning and render nothing when the snippet file or region is
   * missing, instead of throwing.
   * @default false
   */
  silent?: boolean
  /**
   * Which region marker lines to remove from snippet output: `true` removes
   * only markers of the style(s) that matched the requested region, so
   * whole-file imports keep theirs, `'all'` removes markers of every style
   * and name, and `false` keeps all of them.
   * @default true
   */
  stripRegionMarkers?: boolean | 'all'
}

type FenceRenderer = NonNullable<MarkdownItAsync['renderer']['rules']['fence']>

const snippetMarker = '<<<'

const titleRE = /\s*\[(.+)\]$/
const regionRE = /#([\w.-]+)$/
const separatorRE = /[\\/]/
const extensionRE = /\.([a-zA-Z0-9]+)$/
const linesRE = /^\d+(?:[,-]\d+)*$/

export function snippetPlugin(
  md: MarkdownItAsync,
  srcDir: string,
  options: Options = {},
  logger: Pick<Logger, 'warn'> = console
) {
  md.block.ruler.before('fence', 'snippet', createSnippetParser(srcDir))
  const renderFence = md.renderer.rules.fence!
  md.renderer.rules.fence = createSnippetRenderer(renderFence, options, logger)
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

    const { filepath, extension, region, lines, lang, attrs, title } =
      parseSnippetPath(state.src.slice(start, end))

    state.line = startLine + 1

    const token = state.push('fence', 'code', 0)
    token.info = (
      `${lang || extension}${lines ? ` {${lines}}` : ''}` +
      `${attrs ? ` ${attrs}` : ''}${title ? ` [${title}]` : ''}`
    ).trim()

    const { realPath, path: _path } = state.env as MarkdownEnv
    const src = filepath.startsWith('@')
      ? path.join(srcDir, filepath.slice(separatorRE.test(filepath[1]) ? 2 : 1))
      : path.resolve(path.dirname(realPath ?? _path ?? '.'), filepath)

    token.meta = { src, region }
    token.markup = '```'
    token.map = [startLine, startLine + 1]

    return true
  }
}

/**
 * Parses the raw path of a snippet import:
 * `path[#region][{[lines] [lang] [attrs...]}][ [title]]`
 *
 * The suffixes are peeled off right to left, so the path itself may contain
 * spaces and dots. `lines` is the highlight specifier (e.g. `1,2,4-6`),
 * `lang` overrides the extension-derived language and everything after it
 * inside the braces is passed through to the fence info verbatim (e.g.
 * `twoslash`). The title defaults to the file name.
 */
export function parseSnippetPath(rawPath: string) {
  let rest = rawPath.trim()

  let title = ''
  const titleMatch = titleRE.exec(rest)
  if (titleMatch) {
    title = titleMatch[1]
    rest = rest.slice(0, titleMatch.index).trimEnd()
  }

  let lines = ''
  let lang = ''
  let attrs = ''
  const braceStart = rest.lastIndexOf('{')
  if (rest.endsWith('}') && braceStart > 0) {
    ;({ lines, lang, attrs } = parseSnippetMeta(
      rest.slice(braceStart + 1, -1).trim()
    ))
    rest = rest.slice(0, braceStart).trimEnd()
  }

  let region = ''
  const regionMatch = regionRE.exec(rest)
  if (regionMatch) {
    region = regionMatch[1]
    rest = rest.slice(0, regionMatch.index)
  }

  const filepath = rest.trim()
  const filename = filepath.split(separatorRE).pop() ?? ''
  // only alphanumeric suffixes are treated as a language, so that files like
  // `scss.code-snippets` don't end up requesting an unknown grammar; anything
  // else needs the language given explicitly in the braces
  const extension = extensionRE.exec(filename)?.[1] ?? ''

  return {
    filepath,
    extension,
    region,
    lines,
    lang,
    attrs,
    title: title || filename
  }
}

function parseSnippetMeta(meta: string) {
  let lines = ''
  let lang = ''
  let attrs = ''
  if (!meta) return { lines, lang, attrs }

  // tolerate whitespace in a lines-only meta, e.g. `{1, 2}`
  if (/^[\d\s,-]+$/.test(meta)) {
    const collapsed = meta.replace(/\s+/g, '')
    if (linesRE.test(collapsed)) return { lines: collapsed, lang, attrs }
  }

  const first = /^\S+/.exec(meta)![0]
  if (linesRE.test(first)) {
    lines = first
    meta = meta.slice(first.length).trimStart()
  }

  const langMatch = /^\S+/.exec(meta)
  if (langMatch) {
    lang = langMatch[0]
    attrs = meta.slice(langMatch[0].length).trim()
  }

  return { lines, lang, attrs }
}

function createSnippetRenderer(
  renderFence: FenceRenderer,
  options: Options,
  logger: Pick<Logger, 'warn'>
): FenceRenderer {
  return (...args) => {
    const [tokens, idx, , env] = args
    const token = tokens[idx]

    const { src, region } = (token.meta ?? {}) as {
      src?: string
      region?: string
    }
    if (!src) return renderFence(...args)

    const { includes, relativePath } = (env ?? {}) as MarkdownEnv
    includes?.push(src)

    const fail = (message: string): string => {
      if (!options.silent) throw new Error(message)
      logger.warn(relativePath ? `${message} (in ${relativePath})` : message)
      return ''
    }

    let content: string
    try {
      content = readTextFileSync(src)
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code === 'ENOENT') return fail(`Code snippet path not found: ${src}`)
      if (code === 'EISDIR')
        return fail(`Code snippet path is a directory: ${src}`)
      throw error
    }

    let lines = content.split('\n')
    let matchedMarkers: RegionMarker[] | undefined

    if (region) {
      const regions = findRegions(lines, region)
      if (regions.length === 0) {
        return fail(`Code snippet region "${region}" not found in ${src}`)
      }
      lines = regions.flatMap((r) => lines.slice(r.start, r.end))
      matchedMarkers = [...new Set(regions.map((r) => r.marker))]
    }

    const strip = options.stripRegionMarkers ?? true
    if (strip === 'all') {
      lines = stripRegionMarkers(lines)
    } else if (strip === true && matchedMarkers) {
      lines = stripRegionMarkers(lines, matchedMarkers)
    }
    if (region) lines = dedent(lines)

    token.content = lines.join('\n')
    return renderFence(...args)
  }
}
