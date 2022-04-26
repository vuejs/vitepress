import { relative, join } from 'path'

import type { Repository } from '@napi-rs/simple-git'
import { spawn } from 'cross-spawn'

const [GIT_REPO, GIT_PATH]: [Repository, string] | [] = (function () {
  try {
    const { Repository } = require('@napi-rs/simple-git')
    const repo: Repository = new Repository(process.cwd())
    // repo.path() return the `/foo/bar/vitepress/.git/`
    return [repo, join(repo.path(), '..')]
  } catch (e) {
    return []
  }
})()

export function getGitTimestamp(file: string) {
  if (GIT_REPO) {
    return GIT_REPO.getFileLatestModifiedDateAsync(
      relative(GIT_PATH!, file)
    ).catch(() => +new Date())
  }
  return new Promise<number>((resolve, reject) => {
    const child = spawn('git', ['log', '-1', '--pretty="%ci"', file])
    let output = ''
    child.stdout.on('data', (d) => (output += String(d)))
    child.on('close', () => {
      resolve(+new Date(output))
    })
    child.on('error', reject)
  })
}
