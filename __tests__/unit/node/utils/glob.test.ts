import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { glob } from 'node/utils/glob'

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
