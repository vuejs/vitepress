import fs from 'fs-extra'
import matter from 'gray-matter'
import path from 'node:path'
import c from 'picocolors'
import { findRegion } from '../markdown/plugins/snippet'
import { slash } from '../shared'

export function processIncludes(
  srcDir: string,
  src: string,
  file: string,
  includes: string[]
): string {
  const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g
  const regionRE = /(#[\w-]+)/
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
        const regionLines = findRegion(lines, regionName.slice(1))
        content = lines.slice(regionLines?.start, regionLines?.end).join('\n')
      }

      if (range) {
        const [, startLine, endLine] = range
        const lines = content.split(/\r?\n/)
        content = lines
          .slice(
            startLine ? parseInt(startLine, 10) - 1 : undefined,
            endLine ? parseInt(endLine, 10) : undefined
          )
          .join('\n')
      }

      if (!hasMeta && path.extname(includePath) === '.md') {
        content = matter(content).content
      }

      includes.push(slash(includePath))
      // recursively process includes in the content
      return processIncludes(srcDir, content, includePath, includes)

      //
    } catch (error) {
      if (process.env.DEBUG) {
        process.stderr.write(c.yellow(`\nInclude file not found: ${m1}`))
      }

      return m // silently ignore error if file is not present
    }
  })
}
