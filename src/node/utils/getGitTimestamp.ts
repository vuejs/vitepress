import { spawn, sync } from 'cross-spawn'
import { createDebug } from 'obug'
import fs from 'node:fs'
import path from 'node:path'
import { Transform, type TransformCallback } from 'node:stream'
import { slash } from '../shared'

const debug = createDebug('vitepress:git')
const cache = new Map<string, number>()

const RS = 0x1e
const NUL = 0x00
const LF = 0x0a

interface GitLogRecord {
  ts: number
  files: string[]
}

type State = 'READ_TS' | 'READ_FILE'

class GitLogParser extends Transform {
  #state: State = 'READ_TS'
  #tsBytes: number[] = []
  #fileBytes: number[] = []
  #files: string[] = []

  constructor() {
    super({ readableObjectMode: true })
  }

  override _transform(
    chunk: Buffer,
    _enc: BufferEncoding,
    cb: TransformCallback
  ): void {
    try {
      for (let i = 0; i < chunk.length; i++) {
        const b = chunk[i] === LF ? NUL : chunk[i] // treat LF as NUL

        switch (this.#state) {
          case 'READ_TS': {
            if (b === RS) {
              // ignore
            } else if (b === NUL) {
              this.#state = 'READ_FILE'
            } else {
              this.#tsBytes.push(b)
            }
            break
          }

          case 'READ_FILE': {
            if (b === RS) {
              this.#emitRecord()
            } else if (b === NUL) {
              if (this.#fileBytes.length > 0) {
                this.#files.push(Buffer.from(this.#fileBytes).toString('utf8'))
                this.#fileBytes.length = 0
              }
            } else {
              this.#fileBytes.push(b)
            }
            break
          }
        }
      }

      cb()
    } catch (err) {
      cb(err as Error)
    }
  }

  override _flush(cb: TransformCallback): void {
    try {
      if (this.#state === 'READ_FILE') {
        if (this.#fileBytes.length > 0) {
          throw new Error('GitLogParser: unexpected EOF while reading filename')
        } else {
          this.#emitRecord()
        }
      }

      cb()
    } catch (err) {
      cb(err as Error)
    }
  }

  #emitRecord(): void {
    const ts = Buffer.from(this.#tsBytes).toString('utf8')
    const rec: GitLogRecord = {
      ts: Number.parseInt(ts, 10) * 1000,
      files: this.#files.slice()
    }
    if (rec.ts > 0 && rec.files.length > 0) this.push(rec)

    this.#tsBytes.length = 0
    this.#fileBytes.length = 0
    this.#files.length = 0
    this.#state = 'READ_TS'
  }
}

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
    cache.clear()
    const child = spawn('git', args, { cwd: root })

    child.stdout
      .pipe(new GitLogParser())
      .on('data', (rec: GitLogRecord) => {
        for (const file of rec.files) {
          const slashed = slash(path.resolve(gitRoot, file))
          if (!cache.has(slashed)) cache.set(slashed, rec.ts)
        }
      })
      .on('error', reject)
      .on('end', resolve)

    child.on('error', reject)
  })
}

export async function getGitTimestamp(file: string): Promise<number> {
  const cached = cache.get(file)
  if (cached) return cached

  // most likely will never happen except for recently added files in dev
  debug(`[cache miss] ${file}`)

  if (!fs.existsSync(file)) return 0

  return new Promise((resolve, reject) => {
    const child = spawn(
      'git',
      ['log', '-1', '--pretty=%at', '--', path.basename(file)],
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
