import { spawn } from 'cross-spawn'
import fs from 'fs-extra'
import { basename, dirname } from 'path'

const cache = new Map<string, number>()

export function getGitTimestamp(file: string) {
  const cached = cache.get(file)
  if (cached) return cached

  return new Promise<number>((resolve, reject) => {
    const cwd = dirname(file)
    if (!fs.existsSync(cwd)) return resolve(0)
    const fileName = basename(file)
    const child = spawn('git', ['log', '-1', '--pretty="%ai"', fileName], {
      cwd
    })
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
