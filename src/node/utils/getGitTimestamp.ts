import { spawn } from 'cross-spawn'
import { basename, dirname } from 'path'

export function getGitTimestamp(file: string) {
  return new Promise<number>((resolve, reject) => {
    const cwd = dirname(file)
    const fileName = basename(file)
    const child = spawn('git', ['log', '-1', '--pretty="%ci"', fileName], {
      cwd
    })
    let output = ''
    child.stdout.on('data', (d) => (output += String(d)))
    child.on('close', () => {
      resolve(+new Date(output))
    })
    child.on('error', reject)
  })
}
