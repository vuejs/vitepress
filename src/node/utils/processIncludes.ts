import fs from 'fs-extra'
import matter from 'gray-matter'
import path from 'path'
import { slash } from '../shared'
import { findRegion } from '../markdown/plugins/snippet'

export function processIncludes(
  srcDir: string,
  src: string,
  file: string,
  includes: string[]
): string {
  const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g
  const rangeRE = /\{(\d*),(\d*)\}$/
  const regionRE = /(#[\w-]+)/
  return src.replace(includesRE, (m: string, m1: string) => {
    if (!m1.length) return m

    const range = m1.match(rangeRE)
    const region = m1.match(regionRE)
    range && (m1 = m1.slice(0, -range[0].length))
    region && (m1 = m1.slice(0, -region[0].length))

    const atPresent = m1[0] === '@'

    try {
      const includePath = atPresent
        ? path.join(srcDir, m1.slice(m1[1] === '/' ? 2 : 1))
        : path.join(path.dirname(file), m1)
      let content = fs.readFileSync(includePath, 'utf-8')

      if (region) {
        const [regionName] = region
        const lines = content.split(/\r?\n/)
        const regionLines = findRegion(lines, regionName.replace('#', ''))
        content = lines
          .slice(regionLines?.start || undefined, regionLines?.end || undefined)
          .join('\n')
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
      } else {
        content = matter(content).content
      }
      includes.push(slash(includePath))
      // recursively process includes in the content
      return processIncludes(srcDir, content, includePath, includes)
    } catch (error) {
      return m // silently ignore error if file is not present
    }
  })
}
