import { spawn, sync } from 'cross-spawn'
import fs from 'node:fs'
import path from 'node:path'
import { slash } from '../shared'

let cache = new Map<string, number>()

const RS = 0x1e
const NUL = 0x00

export async function cacheAllGitTimestamps(
  root: string,
  pathspec: string[] = ['*.md']
): Promise<void> {
  const cp = sync('git', ['rev-parse', '--show-toplevel'], { cwd: root })
  if (cp.error) throw cp.error
  const gitRoot = cp.stdout.toString('utf8').trim()

  const args = [
    'log',
    '--pretty=format:%x1e%at%x00', // RS + epoch + NUL
    '--name-only',
    '-z',
    '--',
    ...pathspec
  ]

  return new Promise((resolve, reject) => {
    const out = new Map<string, number>()
    const child = spawn('git', args, { cwd: root })

    let buf = Buffer.alloc(0)
    child.stdout.on('data', (chunk: Buffer<ArrayBuffer>) => {
      buf = buf.length ? Buffer.concat([buf, chunk]) : chunk

      let scanFrom = 0
      let ts = 0

      while (true) {
        if (ts === 0) {
          const rs = buf.indexOf(RS, scanFrom)
          if (rs === -1) break
          scanFrom = rs + 1

          const nul = buf.indexOf(NUL, scanFrom)
          if (nul === -1) break
          scanFrom = nul + 2 // skip LF after NUL

          const tsSec = buf.toString('utf8', rs + 1, nul)
          ts = Number.parseInt(tsSec, 10) * 1000
        }

        let nextNul
        while (true) {
          nextNul = buf.indexOf(NUL, scanFrom)
          if (nextNul === -1) break

          // double NUL, move to next record
          if (nextNul === scanFrom) {
            scanFrom += 1
            ts = 0
            break
          }

          const file = buf.toString('utf8', scanFrom, nextNul)
          if (file && !out.has(file)) out.set(file, ts)
          scanFrom = nextNul + 1
        }

        if (nextNul === -1) break
      }

      if (scanFrom > 0) buf = buf.subarray(scanFrom)
    })

    child.on('close', async () => {
      cache.clear()

      for (const [file, ts] of out) {
        const abs = path.resolve(gitRoot, file)
        if (fs.existsSync(abs)) cache.set(slash(abs), ts)
      }

      out.clear()
      resolve()
    })

    child.on('error', reject)
  })
}

export async function getGitTimestamp(file: string): Promise<number> {
  const cached = cache.get(file)
  // most likely will never be stale except for recently added files in dev
  if (cached) return cached

  if (!fs.existsSync(file)) return 0

  return new Promise((resolve, reject) => {
    const child = spawn(
      'git',
      ['log', '-1', '--pretty=%at', path.basename(file)],
      { cwd: path.dirname(file) }
    )

    let output = ''
    child.stdout.on('data', (d) => (output += String(d)))

    child.on('close', () => {
      const ts = Number.parseInt(output.trim(), 10) * 1000
      if (!(ts > 0)) return resolve(0)

      cache.set(file, ts)
      resolve(ts)
    })

    child.on('error', reject)
  })
}
