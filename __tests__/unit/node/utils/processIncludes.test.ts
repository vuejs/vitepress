import { describe, expect, it } from 'vitest'
import { processIncludes } from '../../../../src/node/utils/processIncludes'
import { createMarkdownRenderer } from '../../../../src/node/markdown/markdown'
import path from 'node:path'

describe('processIncludes', () => {
  it('should handle heading includes with frontmatter', async () => {
    const srcDir = path.resolve(__dirname, 'fixtures/include-frontmatter')
    const filePath = path.join(srcDir, 'importing.md')
    const src = `<!--@include: ./source.md#target-section-->`

    const md = await createMarkdownRenderer(srcDir)
    const includes: string[] = []
    const result = processIncludes(md, srcDir, src, filePath, includes, false)

    // The result should contain the target section content
    expect(result).toContain('This line should be included.')
    expect(result).toContain(
      'Nested content should also be included if it belongs to Target Section.'
    )

    // The result should NOT contain frontmatter
    expect(result).not.toContain(
      'description: This page has frontmatter description'
    )
    expect(result).not.toContain('This page has frontmatter description')

    // The result should NOT contain content from other sections
    expect(result).not.toContain('Intro text before the target heading.')
    expect(result).not.toContain('This line should NOT be included.')
    expect(result).not.toContain('## Other Section')

    // The result should NOT contain the frontmatter description as content
    expect(result).not.toMatch(/This page has frontmatter description/)
  })

  it('should handle heading includes without frontmatter', async () => {
    const srcDir = path.resolve(__dirname, 'fixtures/include-frontmatter')
    const filePath = path.join(srcDir, 'importing.md')
    const src = `<!--@include: ./source-no-frontmatter.md#target-section-->`

    const md = await createMarkdownRenderer(srcDir)
    const includes: string[] = []
    const result = processIncludes(md, srcDir, src, filePath, includes, false)

    // The result should contain the target section content
    expect(result).toContain('This line should be included.')
    expect(result).toContain(
      'Nested content should also be included if it belongs to Target Section.'
    )

    // The result should NOT contain content from other sections
    expect(result).not.toContain('Intro text before the target heading.')
    expect(result).not.toContain('This line should NOT be included.')
  })

  it('should handle full file include with frontmatter', async () => {
    const srcDir = path.resolve(__dirname, 'fixtures/include-frontmatter')
    const filePath = path.join(srcDir, 'importing.md')
    const src = `<!--@include: ./source.md-->`

    const md = await createMarkdownRenderer(srcDir)
    const includes: string[] = []
    const result = processIncludes(md, srcDir, src, filePath, includes, false)

    // Full file include should strip frontmatter
    expect(result).not.toContain(
      'description: This page has frontmatter description'
    )

    // But should contain the main content
    expect(result).toContain('# Source Page')
    expect(result).toContain('Intro text before the target heading.')
    expect(result).toContain('## Target Section')
  })
})
