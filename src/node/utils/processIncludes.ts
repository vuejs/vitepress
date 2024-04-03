import fs from 'fs-extra'
import matter from 'gray-matter'
import path from 'path'
import { slash } from '../shared'

export function processIncludesRelativePath(
  srcDir: string,
  includePath: string,
  src: string
): string {
  const relativeRE = /\((\.{1,2}.*)\)/g
  return src.replace(relativeRE, (m, p1) => {
    try {
      const resolvedSrcDir = path.resolve(srcDir)
      // use platform-specific file separator to get include file's dir
      const includeFileDir = includePath.substring(
        0,
        includePath.lastIndexOf(path.sep) + 1
      )
      // get relative path to project root
      const p1Path = path
        .resolve(includeFileDir, p1)
        .substring(resolvedSrcDir.length)
      // replace win32's separator to /
      const p1PathInVite = p1Path.replace(path.win32.sep, '/')
      return '(' + p1PathInVite + ')'
    } catch {
      return m
    }
  })
}

export function processIncludes(
  srcDir: string,
  src: string,
  file: string,
  includes: string[]
): string {
  const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g
  const rangeRE = /\{(\d*),(\d*)\}$/
  return src.replace(includesRE, (m: string, m1: string) => {
    if (!m1.length) return m

    const range = m1.match(rangeRE)
    range && (m1 = m1.slice(0, -range[0].length))
    const atPresent = m1[0] === '@'
    try {
      const includePath = atPresent
        ? path.join(srcDir, m1.slice(m1[1] === '/' ? 2 : 1))
        : path.join(path.dirname(file), m1)
      let content = fs.readFileSync(includePath, 'utf-8')
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
      content = processIncludesRelativePath(srcDir, includePath, content)
      includes.push(slash(includePath))
      // recursively process includes in the content
      return processIncludes(srcDir, content, includePath, includes)
    } catch (error) {
      return m // silently ignore error if file is not present
    }
  })
}
