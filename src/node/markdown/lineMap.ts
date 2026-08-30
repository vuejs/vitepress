import type { MarkdownLineMap } from '../shared'

/**
 * One contiguous run of rendered-source lines that all come from the same
 * file. A segment covers the lines from `start` up to the next segment's
 * `start` (or the end of the document).
 */
export interface LineMapSegment {
  /** first rendered-source line this segment covers (0-based) */
  start: number
  /** absolute path of the physical source file */
  file: string
  /** line in `file` that `start` corresponds to (0-based) */
  line: number
}

/**
 * Maps 0-based lines of the rendered markdown source (`env.src`) back to the
 * physical file and 0-based line they came from. Built by the include plugin
 * while expanding `<!-- @include -->` directives; a page without includes
 * gets a single identity segment.
 */
export class LineMap implements MarkdownLineMap {
  readonly segments: LineMapSegment[]
  /** lines stitched together from more than one source (mid-line splices) */
  private readonly splicedLines: ReadonlySet<number>

  constructor(segments: LineMapSegment[], splicedLines?: ReadonlySet<number>) {
    this.segments = segments
    this.splicedLines = splicedLines ?? new Set()
  }

  resolve(line: number): { file: string; line: number; spliced?: boolean } {
    const segments = this.segments
    let lo = 0
    let hi = segments.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (segments[mid].start <= line) lo = mid + 1
      else hi = mid
    }
    const segment = segments[Math.max(0, lo - 1)]
    return {
      file: segment.file,
      line: segment.line + Math.max(0, line - segment.start),
      ...(this.splicedLines.has(line) && { spliced: true })
    }
  }
}

/**
 * Assembles an output string from mapped chunks, tracking which file each
 * output line starts in. A chunk appended mid-line contributes no mapping
 * for that line — the line is attributed to whoever started it.
 */
export class MappedBuilder {
  private out = ''
  private outLine = 0
  private midLine = false
  private readonly segments: LineMapSegment[] = []
  private readonly splicedLines = new Set<number>()

  /**
   * Appends `text`, whose lines are described by `segments` in the text's
   * own 0-based line coordinates.
   */
  append(
    text: string,
    segments: LineMapSegment[],
    splicedLines?: ReadonlySet<number>
  ): void {
    if (!text) return

    // a mid-line append stitches this output line together from more than
    // one source, so column positions on it are not meaningful
    if (this.midLine) this.splicedLines.add(this.outLine)
    if (splicedLines) {
      for (const line of splicedLines)
        this.splicedLines.add(this.outLine + line)
    }

    const breaks = countLineBreaks(text)
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const segmentEnd =
        i + 1 < segments.length ? segments[i + 1].start : Infinity
      // the first line of a mid-line append merges into the current output
      // line, which already has an owner
      const from = this.midLine ? Math.max(segment.start, 1) : segment.start
      if (from >= segmentEnd || from > breaks) continue
      this.push({
        start: this.outLine + from,
        file: segment.file,
        line: segment.line + (from - segment.start)
      })
    }

    this.out += text
    this.outLine += breaks
    this.midLine = text[text.length - 1] !== '\n'
  }

  private push(segment: LineMapSegment): void {
    const prev = this.segments[this.segments.length - 1]
    if (prev) {
      // exact continuation of the previous segment — nothing new to record
      if (
        prev.file === segment.file &&
        segment.line - prev.line === segment.start - prev.start
      ) {
        return
      }
      if (prev.start === segment.start) {
        this.segments[this.segments.length - 1] = segment
        return
      }
    }
    this.segments.push(segment)
  }

  build(): {
    src: string
    segments: LineMapSegment[]
    splicedLines: Set<number>
  } {
    return {
      src: this.out,
      segments: this.segments,
      splicedLines: this.splicedLines
    }
  }
}

/**
 * The sub-list of segments covering lines `[from, to)`, rebased so `from`
 * becomes line 0.
 */
export function sliceSegments(
  segments: LineMapSegment[],
  from: number,
  to: number
): LineMapSegment[] {
  const out: LineMapSegment[] = []
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const segmentEnd =
      i + 1 < segments.length ? segments[i + 1].start : Infinity
    const start = Math.max(segment.start, from)
    if (start >= Math.min(segmentEnd, to)) continue
    out.push({
      start: start - from,
      file: segment.file,
      line: segment.line + (start - segment.start)
    })
  }
  return out
}

export function offsetSegments(
  segments: LineMapSegment[],
  delta: number
): LineMapSegment[] {
  return segments.map((s) => ({ ...s, start: s.start + delta }))
}

/** resolves a line against raw segments, like `LineMap.resolve` */
export function resolveInSegments(
  segments: LineMapSegment[],
  line: number
): { file: string; line: number } {
  return new LineMap(segments).resolve(line)
}

// mirrors markdown-it's newline normalization (`\r\n?|\n`)
const lineBreakRE = /\r\n?|\n/g

export function countLineBreaks(str: string): number {
  return str.match(lineBreakRE)?.length ?? 0
}
