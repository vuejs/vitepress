import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { glob, isGlobMatch } from 'node/utils/glob'

describe('node/utils/glob', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-glob-'))
    for (const dir of ['drafts', 'dist', 'node_modules']) {
      await mkdir(path.join(root, dir))
      await writeFile(path.join(root, dir, 'post.md'), '# Post')
    }
    await writeFile(path.join(root, 'published.md'), '# Published')
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  test.each([{ ignore: 'drafts/**' }, { ignore: ['drafts/**'] }])(
    'accepts an ignore pattern as $ignore',
    async ({ ignore }) => {
      expect(await glob(['**/*.md'], { cwd: root, ignore })).toEqual([
        'published.md'
      ])
    }
  )

  test('keeps the default exclusions without a custom ignore pattern', async () => {
    expect(await glob(['**/*.md'], { cwd: root })).toEqual([
      'drafts/post.md',
      'published.md'
    ])
  })
})

describe('node/utils/glob isGlobMatch', () => {
  const patterns = ['/root/posts/**/*.md', '!/root/posts/draft.md']

  test('treats negated patterns as exclusions', () => {
    expect(isGlobMatch('/root/posts/a.md', patterns)).toBe(true)
    expect(isGlobMatch('/root/posts/draft.md', patterns)).toBe(false)
    expect(isGlobMatch('/root/other.md', patterns)).toBe(false)
  })

  test.each([{ ignore: '**/drafts/**' }, { ignore: ['**/drafts/**'] }])(
    'combines negated patterns with ignore as $ignore',
    (options) => {
      expect(isGlobMatch('/root/posts/b/c.md', patterns, options)).toBe(true)
      expect(isGlobMatch('/root/posts/drafts/c.md', patterns, options)).toBe(
        false
      )
      expect(isGlobMatch('/root/posts/draft.md', patterns, options)).toBe(false)
    }
  )
})
