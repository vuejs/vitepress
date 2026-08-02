import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import {
  cacheAllGitTimestamps,
  getGitTimestamp
} from 'node/utils/getGitTimestamp'

const execFileAsync = promisify(execFile)

test('development cache misses are retried after a file is committed', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'vitepress-git-'))
  const page = path.join(root, 'page.md')

  try {
    await execFileAsync('git', ['init'], { cwd: root })
    await writeFile(page, '# Page')
    await cacheAllGitTimestamps(root)

    expect(await getGitTimestamp(page)).toBe(0)

    await execFileAsync('git', ['add', 'page.md'], { cwd: root })
    await execFileAsync(
      'git',
      [
        '-c',
        'user.name=VitePress Test',
        '-c',
        'user.email=vitepress@example.com',
        'commit',
        '-m',
        'add page'
      ],
      { cwd: root }
    )

    expect(await getGitTimestamp(page)).toBeGreaterThan(0)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
