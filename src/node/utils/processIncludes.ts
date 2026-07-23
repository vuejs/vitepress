import matter from 'gray-matter'
import type { MarkdownItAsync } from 'markdown-it-async'
import fs from 'node:fs'
import path from 'node:path'
import { findRegions } from '../markdown/plugins/snippet'
import { slash, type MarkdownEnv } from '../shared'

export function processIncludes(
  md: MarkdownItAsync,
  srcDir: string,
  src: string,
  file: string,
  includes: string[],
  cleanUrls: boolean
): string {
  const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g
  const regionRE = /#([^\s\{]+)$/
  const rangeRE = /\{(\d*),(\d*)\}$/

  return src.replace(includesRE, (m: string, m1: string) => {
    if (!m1.length) return m

    const rangeMeta = m1.match(rangeRE)
    if (rangeMeta) {
      m1 = m1.replace(rangeRE, '')
    }

    const regionMeta = m1.match(regionRE)
    if (regionMeta) {
      m1 = m1.replace(regionRE, '')
    }

    const atPresent = m1[0] === '@'
    const includePath = atPresent
      ? path.join(srcDir, m1.slice(m1[1] === '/' ? 2 : 1))
      : path.join(path.dirname(file), m1)

    let content = fs.readFileSync(includePath, 'utf-8')

    // for markdown files, if a range is used without a region,
    // the line numbers must account for the frontmatter,
    // so we leave it, otherwise we will strip it out
    if (path.extname(includePath) === '.md' && (regionMeta || !rangeMeta)) {
      content = matter(content).content
    }

    let lines = content.split(/\r?\n/)

    if (regionMeta) {
      const [, region] = regionMeta
      const regions = findRegions(lines, region)

      if (regions.length === 0) {
        // region not found, it might be a header

        // can use `content` because `lines` has not been mutated yet
        const tokens = md
          .parse(content, {
            path: includePath,
            relativePath: slash(path.relative(srcDir, includePath)),
            cleanUrls
          } satisfies MarkdownEnv)
          .filter((t) => t.type === 'heading_open' && t.map)
        const idx = tokens.findIndex((t) => t.attrGet('id') === region)
        const token = tokens[idx]

        if (token) {
          const start = token.map![1]
          const level = parseInt(token.tag.slice(1))
          let end = Infinity
          for (let i = idx + 1; i < tokens.length; i++) {
            if (parseInt(tokens[i].tag.slice(1)) <= level) {
              end = tokens[i].map![0]
              break
            }
          }
          regions.push({ start, end })
        }
      }

      if (regions.length > 0) {
        lines = regions.flatMap((r) => lines.slice(r.start, r.end))
      } else {
        lines = [
          `No region or heading #${region} found in path: ${includePath}`
        ]
      }
    }

    if (rangeMeta) {
      const [, startLine, endLine] = rangeMeta
      lines = lines.slice(
        startLine ? parseInt(startLine) - 1 : undefined,
        endLine ? parseInt(endLine) : undefined
      )
    }

    includes.push(slash(includePath))

    // recursively process includes in the content
    return processIncludes(
      md,
      srcDir,
      lines.join('\n'),
      includePath,
      includes,
      cleanUrls
    )
  })
}
