import { spawn, sync } from 'cross-spawn'
import { once } from 'node:events'
import fs from 'node:fs'
import path from 'node:path'
import { Transform, type TransformCallback } from 'node:stream'
import { createDebug } from 'obug'
import { slash } from '../shared'

const debug = createDebug('vitepress:git')
const cache = new Map<string, number>()
const authoritativeRoots = new Set<string>()

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
  pathspec: string[] = ['*.md'],
  cacheMissing = false
): Promise<void> {
  const cp = sync('git', ['rev-parse', '--show-toplevel'], { cwd: root })
  if (cp.error) throw cp.error
  if (cp.status !== 0) {
    throw new Error(
      `git rev-parse failed (${cp.signal ? `signal ${cp.signal}` : `exit ${cp.status}`}): ${cp.stderr.toString('utf8').trim()}`
    )
  }
  const gitRoot = slash(path.resolve(cp.stdout.toString('utf8').trim()))
  const head = sync('git', ['rev-parse', '--verify', 'HEAD^{commit}'], {
    cwd: root
  })
  if (head.error) throw head.error
  if (head.status !== 0) {
    publishGitCache(gitRoot, new Map(), cacheMissing)
    return
  }

  const args = [
    'log',
    '--pretty=format:%x1e%at%x00', // RS + epoch + NUL
    '--name-only',
    '-z',
    '--',
    ...pathspec
  ]

  const child = spawn('git', args, { cwd: root })
  const records = child.stdout.pipe(new GitLogParser())
  child.on('error', (err) => records.destroy(err))
  let stderr = ''
  child.stderr.setEncoding('utf8')
  child.stderr.on('data', (chunk) => {
    stderr += chunk
  })
  const close = once(child, 'close') as Promise<
    [code: number | null, signal: NodeJS.Signals | null]
  >
  const nextCache = new Map<string, number>()

  for await (const rec of records as AsyncIterable<GitLogRecord>) {
    for (const file of rec.files) {
      const slashed = slash(path.resolve(gitRoot, file))
      if (!nextCache.has(slashed)) nextCache.set(slashed, rec.ts)
    }
  }

  const [code, signal] = await close
  if (code !== 0) {
    throw new Error(
      `git log failed (${signal ? `signal ${signal}` : `exit ${code}`}): ${stderr.trim()}`
    )
  }

  // Publish the complete repository snapshot in one operation. Keep other
  // repository caches valid during multi-site builds.
  publishGitCache(gitRoot, nextCache, cacheMissing)
}

export async function getGitTimestamp(file: string): Promise<number> {
  const normalizedFile = slash(path.resolve(file))
  const cached = cache.get(normalizedFile)
  if (cached !== undefined) return cached

  // The production scan is the complete history snapshot. Missing files are
  // untracked or have no commits. Do not start a Git process for each miss,
  // especially for generated routes.
  if (
    [...authoritativeRoots].some((root) => isWithinRoot(normalizedFile, root))
  ) {
    cache.set(normalizedFile, 0)
    return 0
  }

  // most likely will never happen except for recently added files in dev
  debug(`[cache miss] ${file}`)

  if (!fs.existsSync(file)) {
    return 0
  }

  const head = sync('git', ['rev-parse', '--verify', 'HEAD^{commit}'], {
    cwd: path.dirname(file)
  })
  if (head.error) throw head.error
  if (head.status !== 0) return 0

  const child = spawn(
    'git',
    ['log', '-1', '--pretty=%at', '--', path.basename(file)],
    { cwd: path.dirname(file) }
  )

  let output = ''
  child.stdout.on('data', (d) => (output += String(d)))
  const [code, signal] = (await once(child, 'close')) as [
    number | null,
    NodeJS.Signals | null
  ]
  if (code !== 0) {
    throw new Error(
      `git log failed for ${file} (${signal ? `signal ${signal}` : `exit ${code}`}).`
    )
  }

  const ts = Number.parseInt(output.trim(), 10) * 1000
  if (!(ts > 0)) {
    return 0
  }

  cache.set(normalizedFile, ts)
  return ts
}

function isWithinRoot(file: string, root: string): boolean {
  return file === root || file.startsWith(`${root}/`)
}

function publishGitCache(
  gitRoot: string,
  nextCache: ReadonlyMap<string, number>,
  cacheMissing: boolean
): void {
  for (const file of cache.keys()) {
    if (isWithinRoot(file, gitRoot)) cache.delete(file)
  }
  for (const [file, timestamp] of nextCache) cache.set(file, timestamp)
  if (cacheMissing) authoritativeRoots.add(gitRoot)
  else authoritativeRoots.delete(gitRoot)
}
