export interface RegionMarker {
  start: RegExp
  end: RegExp
}

export interface Region {
  start: number
  end: number
  marker: RegionMarker
}

// cheap pre-filter so the marker regexes only run on candidate lines
const maybeMarkerRE = /region/i
const quotedRE = /^"(.*)"$/

// visual basic names its regions `#Region "Name"`, so the quotes are part of
// the captured name and have to be dropped to make it referenceable
function unquote(name: string) {
  return quotedRE.exec(name)?.[1] ?? name
}

/**
 * Region marker styles, derived from the `folding.markers` definitions VS Code
 * ships per language and merged per comment syntax, keeping the hash optional
 * where at least one of the merged languages makes it optional. Since a
 * markdown renderer cannot know the language of an imported file, every style
 * is tried on every file, which makes this a superset: everything an editor
 * folds is extracted, but not the reverse. Note that a language service can
 * be stricter than the marker it ships - TypeScript, for one, requires the
 * hash that the ts/js marker makes optional.
 */
export const markers: RegionMarker[] = [
  // line comments: js, ts, go, rust, java and json with comments, whose
  // markers make the hash optional, plus sql and bat, which require it
  {
    start: /^\s*(?:\/\/\s*#?|(?:--|::|@?[rR][eE][mM])\s*#)region\b\s*(.*?)\s*$/,
    end: /^\s*(?:\/\/\s*#?|(?:--|::|@?[rR][eE][mM])\s*#)endregion\b\s*(.*?)\s*$/
  },
  // hash comments: c# and coffeescript (`#region`), python, yaml and shell
  // (`# region`, and `# #region` in shell), visual basic (`#Region` closed by
  // `#End Region`), powershell (`#EndRegion`) and c/c++ (`#pragma region`)
  {
    start: /^\s*#\s*(?:#\s*|pragma\s+)?[rR]egion\b\s*(.*?)\s*$/,
    end: /^\s*#\s*(?:#\s*|pragma\s+)?[eE]nd ?[rR]egion\b\s*(.*?)\s*$/
  },
  // markdown (hash optional) and html (hash required), vue templates
  {
    start: /^\s*<!--\s*#?region\b\s*(.*?)\s*-->/,
    end: /^\s*<!--\s*#?endregion\b\s*(.*?)\s*-->/
  },
  // css, less and scss
  {
    start: /^\s*\/\*\s*#region\b\s*(.*?)\s*\*\//,
    end: /^\s*\/\*\s*#endregion\b\s*(.*?)\s*\*\//
  },
  // f# block comments; its `// #region` form is covered by the line comments
  // above
  {
    start: /^\s*\(\*\s*#region\b\s*(.*?)\s*\*\)/,
    end: /^\s*\(\*\s*#endregion\b\s*(.*?)\s*\*\)/
  },
  // json keys, e.g. `"// #region name": "",` - VS Code cannot fold these,
  // since plain json has no comments to put a marker in
  {
    start: /^\s*"\/{2,}\s*#region\b\s*(.*?)":\s*"",?\s*$/,
    end: /^\s*"\/{2,}\s*#endregion\b\s*(.*?)":\s*"",?\s*$/
  }
]

/**
 * Finds all regions with the given name, in document order. Matching is
 * name-based across all marker styles, so a region opened by one comment
 * style may be closed by another - useful in files mixing languages, like
 * Vue SFCs. All regions are tracked, not just the requested ones, so that an
 * end marker without a name closes the innermost open region rather than the
 * requested one. Nested regions with the requested name yield the outermost
 * span.
 */
export function findRegions(lines: string[], name: string): Region[] {
  const regions: Region[] = []
  const open: { name: string; start: number; marker: RegionMarker }[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!maybeMarkerRE.test(line)) continue

    let isStart = false
    for (const marker of markers) {
      const startName = marker.start.exec(line)?.[1]
      if (startName != null) {
        open.push({ name: unquote(startName), start: i + 1, marker })
        isStart = true
        break
      }
    }
    if (isStart || open.length === 0) continue

    for (const marker of markers) {
      const rawEndName = marker.end.exec(line)?.[1]
      if (rawEndName == null) continue
      const endName = unquote(rawEndName)

      // a named end marker closes the innermost region it names, whichever
      // comment style opened it, while an unnamed one closes the innermost
      // region opened in its own comment style - so it can neither be
      // captured by a region of another language nested inside, nor close
      // one that was left open there
      const index = endName
        ? open.findLastIndex((r) => r.name === endName)
        : open.findLastIndex((r) => r.marker === marker)
      if (index === -1) continue

      const [closed] = open.splice(index, open.length - index)
      if (closed.name === name && !open.some((r) => r.name === name)) {
        regions.push({ start: closed.start, end: i, marker: closed.marker })
      }
      break
    }
  }

  return regions
}

/**
 * Removes region marker lines of the given styles (all styles by default),
 * regardless of region name.
 */
export function stripRegionMarkers(
  lines: string[],
  styles: RegionMarker[] = markers
): string[] {
  return lines.filter(
    (line) =>
      !maybeMarkerRE.test(line) ||
      !styles.some((m) => m.start.test(line) || m.end.test(line))
  )
}

/**
 * Removes the common minimal indentation (spaces and tabs counted per
 * character) from the given lines. Whitespace-only lines don't constrain
 * the minimum.
 */
export function dedent(lines: string[]): string[] {
  let minIndent = Infinity

  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== ' ' && line[i] !== '\t') {
        minIndent = Math.min(i, minIndent)
        break
      }
    }
    if (minIndent === 0) break
  }

  if (minIndent === Infinity || minIndent === 0) return lines
  return lines.map((line) => line.slice(minIndent))
}
