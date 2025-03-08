import fs from 'fs-extra'
import matter from 'gray-matter'
import type { MarkdownItAsync } from 'markdown-it-async'
import path from 'node:path'
import c from 'picocolors'
import { findRegion } from '../markdown/plugins/snippet'
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
  const regionRE = /(#[^\s\{]+)/
  const rangeRE = /\{(\d*),(\d*)\}$/

  return src.replace(includesRE, (m: string, m1: string) => {
    if (!m1.length) return m

    const range = m1.match(rangeRE)
    const region = m1.match(regionRE)

    const hasMeta = !!(region || range)

    if (hasMeta) {
      const len = (region?.[0].length || 0) + (range?.[0].length || 0)
      m1 = m1.slice(0, -len) // remove meta info from the include path
    }

    const atPresent = m1[0] === '@'

    try {
      const includePath = atPresent
        ? path.join(srcDir, m1.slice(m1[1] === '/' ? 2 : 1))
        : path.join(path.dirname(file), m1)
      let content = fs.readFileSync(includePath, 'utf-8')

      if (region) {
        const [regionName] = region
        const lines = content.split(/\r?\n/)
        let { start, end } = findRegion(lines, regionName.slice(1)) ?? {}

        if (start === undefined) {
          // region not found, it might be a header
          const tokens = md
            .parse(content, {
              path: includePath,
              relativePath: slash(path.relative(srcDir, includePath)),
              cleanUrls
            } satisfies MarkdownEnv)
            .filter((t) => t.type === 'heading_open' && t.map)
          const idx = tokens.findIndex(
            (t) => t.attrGet('id') === regionName.slice(1)
          )
          const token = tokens[idx]
          if (token) {
            start = token.map![1]
            const level = parseInt(token.tag.slice(1))
            for (let i = idx + 1; i < tokens.length; i++) {
              if (parseInt(tokens[i].tag.slice(1)) <= level) {
                end = tokens[i].map![0]
                break
              }
            }
          }
        }

        content = lines.slice(start, end).join('\n')
      }

      if (range) {
        const [, startLine, endLine] = range
        const lines = content.split(/\r?\n/)
        content = lines
          .slice(
            startLine ? parseInt(startLine) - 1 : undefined,
            endLine ? parseInt(endLine) : undefined
          )
          .join('\n')
      }

      if (!hasMeta && path.extname(includePath) === '.md') {
        content = matter(content).content
      }

      includes.push(slash(includePath))
      // recursively process includes in the content
      return processIncludes(
        md,
        srcDir,
        content,
        includePath,
        includes,
        cleanUrls
      )

      //
    } catch (error) {
      if (process.env.DEBUG) {
        process.stderr.write(c.yellow(`\nInclude file not found: ${m1}`))
      }

      return m // silently ignore error if file is not present
    }
  })
}
