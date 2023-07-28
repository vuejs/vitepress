import { spawn } from 'cross-spawn'
import { basename, dirname } from 'path'
import fs from 'fs-extra'

const cache = new Map<string, number>()

export function getGitTimestamp(file: string) {
  const cached = cache.get(file)
  if (cached) return cached

  return new Promise<number>((resolve, reject) => {
    if (!fs.existsSync(file)) {
      const currentTimestamp = +new Date()
      resolve(currentTimestamp)
      return
    }
    const cwd = dirname(file)
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
