import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { readFile, readTextFile, readTextFileSync } from 'node/utils/fs'

describe('node/utils/fs', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-fs-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  test('readFile keeps line endings as is', async () => {
    const file = path.join(root, 'crlf.txt')
    await writeFile(file, 'a\r\nb\rc\nd')
    expect(await readFile(file)).toBe('a\r\nb\rc\nd')
  })

  test('readTextFile normalizes CRLF and CR to LF', async () => {
    const file = path.join(root, 'crlf.txt')
    await writeFile(file, 'a\r\nb\rc\nd')
    expect(await readTextFile(file)).toBe('a\nb\nc\nd')
  })

  test('readTextFileSync normalizes CRLF and CR to LF', async () => {
    const file = path.join(root, 'crlf.txt')
    await writeFile(file, 'a\r\nb\rc\nd')
    expect(readTextFileSync(file)).toBe('a\nb\nc\nd')
  })
})
