import { spawn } from 'cross-spawn'
import fs from 'fs-extra'
import { basename, dirname } from 'node:path'

const cache = new Map<string, number>()

export function getGitTimestamp(file: string) {
  const cached = cache.get(file)
  if (cached) return cached

  if (!fs.existsSync(file)) return 0

  return new Promise<number>((resolve, reject) => {
    const child = spawn(
      'git',
      ['log', '-1', '--pretty="%ai"', basename(file)],
      { cwd: dirname(file) }
    )

    let output = ''
    child.stdout.on('data', (d) => (output += String(d)))

    child.on('close', () => {
      const timestamp = +new Date(output)
      cache.set(file, timestamp)
      resolve(timestamp)
    })

    child.on('error', reject)
  })
}
