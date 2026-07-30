import { createMarkdownItAsync } from 'markdown-it-async'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { processIncludes } from 'node/utils/processIncludes'

describe('node/utils/processIncludes', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-includes-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  async function write(name: string, src: string) {
    await writeFile(path.join(root, name), src)
  }

  async function run(name: string) {
    const file = path.join(root, name)
    const src = await readFile(file, 'utf8')
    return processIncludes(createMarkdownItAsync(), root, src, file, [], false)
  }

  test('leaves a self-include unexpanded', async () => {
    await write('a.md', '# A\n\n<!-- @include: ./a.md -->\n')

    expect(await run('a.md')).toContain('<!-- @include: ./a.md -->')
  })

  test('leaves circular includes unexpanded', async () => {
    await write('a.md', 'A-content\n\n<!-- @include: ./b.md -->\n')
    await write('b.md', 'B-content\n\n<!-- @include: ./a.md -->\n')

    const result = await run('a.md')
    expect(result).toContain('B-content')
    expect(result).toContain('<!-- @include: ./a.md -->')
  })

  test('expands repeated includes outside the ancestor chain', async () => {
    await write(
      'a.md',
      '<!-- @include: ./b.md -->\n<!-- @include: ./c.md -->\n'
    )
    await write('b.md', 'B-content\n\n<!-- @include: ./d.md -->\n')
    await write('c.md', 'C-content\n\n<!-- @include: ./d.md -->\n')
    await write('d.md', 'D-content\n')

    expect((await run('a.md')).match(/D-content/g)).toHaveLength(2)
  })
})
