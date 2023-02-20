import { spawn } from 'cross-spawn'
import type { ChildProcessWithoutNullStreams } from 'child_process'

export function getLastUpdatedTimestampFromGit(file: string) {
  const child = spawn('git', ['log', '-1', '--pretty="%ci"', file])
  return handleChildProcess(file, child)
}

export function getCreatedTimestampFromGit(file: string) {
  const child = spawn('git', [
    'log',
    '-1',
    '--diff-filter=A',
    '--follow',
    '--format="%ci"',
    file
  ])
  return handleChildProcess(file, child)
}

function handleChildProcess(
  file: string,
  child: ChildProcessWithoutNullStreams
) {
  return new Promise<number>((resolve, reject) => {
    let output = ''
    child.stdout.on('data', (d) => (output += String(d)))
    child.on('close', () => {
      resolve(+new Date(output))
    })
    child.on('error', reject)
  })
}
