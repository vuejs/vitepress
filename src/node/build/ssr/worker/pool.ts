import { spawn, type ChildProcess } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { SsrRenderWorkerDescriptor } from './protocol'

const WORKER_ENTRYPOINT_FLAGS = new Set([
  '-c',
  '--check',
  '-i',
  '--interactive',
  '--test',
  '--watch',
  '--watch-preserve-output'
])

const WORKER_ENTRYPOINT_FLAGS_WITH_VALUES = new Set([
  '-e',
  '--eval',
  '-p',
  '--print',
  '--input-type',
  '--run',
  '--watch-path',
  '--test-concurrency',
  '--test-isolation',
  '--test-name-pattern',
  '--test-reporter',
  '--test-reporter-destination',
  '--test-shard',
  '--test-timeout'
])

export class SsrRenderWorkerPool {
  readonly #active = new Set<ChildProcess>()
  readonly #terminateOnParentExit = () => this.terminate()
  #listening = false
  #failed = false

  async run(
    descriptor: SsrRenderWorkerDescriptor,
    descriptorPath: string
  ): Promise<void> {
    if (this.#failed) {
      throw new Error('The SSR render worker pool has already failed.')
    }

    await writeFile(descriptorPath, JSON.stringify(descriptor), { mode: 0o600 })
    const workerEntry = fileURLToPath(new URL('./entry.js', import.meta.url))
    const child = spawn(
      process.execPath,
      [...createWorkerExecArgv(process.execArgv), workerEntry, descriptorPath],
      { cwd: process.cwd(), stdio: 'inherit' }
    )

    this.#active.add(child)
    if (!this.#listening) {
      process.once('exit', this.#terminateOnParentExit)
      this.#listening = true
    }

    try {
      await new Promise<void>((resolve, reject) => {
        let settled = false
        const finish = (error?: unknown) => {
          if (settled) return
          settled = true
          if (error) reject(error)
          else resolve()
        }

        child.once('error', finish)
        child.once('exit', (code, signal) => {
          if (code === 0) {
            finish()
          } else {
            finish(
              new Error(
                `SSR render worker failed (${signal ? `signal ${signal}` : `exit ${code}`}).`
              )
            )
          }
        })
      })
    } catch (error) {
      this.#failed = true
      this.terminate()
      throw error
    } finally {
      this.#active.delete(child)
      this.#stopListeningWhenIdle()
    }
  }

  terminate(): void {
    for (const child of this.#active) {
      if (child.exitCode === null && child.signalCode === null) child.kill()
    }
  }

  async dispose(): Promise<void> {
    const exits = [...this.#active].map(waitForExit)
    this.terminate()
    await Promise.all(exits)
    if (this.#listening) {
      process.removeListener('exit', this.#terminateOnParentExit)
      this.#listening = false
    }
  }

  #stopListeningWhenIdle(): void {
    if (this.#active.size === 0 && this.#listening) {
      process.removeListener('exit', this.#terminateOnParentExit)
      this.#listening = false
    }
  }
}

function waitForExit(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    const finish = () => {
      child.removeListener('exit', finish)
      child.removeListener('error', finish)
      resolve()
    }
    child.once('exit', finish)
    child.once('error', finish)
  })
}

export function createWorkerExecArgv(execArgv: readonly string[]): string[] {
  const result: string[] = []
  for (let index = 0; index < execArgv.length; index++) {
    const argument = execArgv[index]

    if (argument === '--') continue

    const shortEntrypointFlags = /^-([ceip]+)$/.exec(argument)?.[1]
    if (shortEntrypointFlags) {
      if (/[ep]/.test(shortEntrypointFlags) && index + 1 < execArgv.length) {
        index++
      }
      continue
    }

    if (WORKER_ENTRYPOINT_FLAGS.has(argument)) continue

    const valueFlag = [...WORKER_ENTRYPOINT_FLAGS_WITH_VALUES].find(
      (flag) => argument === flag || argument.startsWith(`${flag}=`)
    )
    if (valueFlag) {
      if (argument === valueFlag && index + 1 < execArgv.length) index++
      continue
    }

    if (
      argument.startsWith('--test-') ||
      argument.startsWith('--experimental-test-') ||
      argument.startsWith('--watch-')
    ) {
      if (
        !argument.includes('=') &&
        index + 1 < execArgv.length &&
        !execArgv[index + 1].startsWith('-')
      ) {
        index++
      }
      continue
    }

    if (!argument.startsWith('--inspect')) result.push(argument)

    if (
      (argument === '--inspect-port' || argument === '--inspect-publish-uid') &&
      index + 1 < execArgv.length
    ) {
      index++
    }
  }

  for (const flag of [
    '--no-inspect',
    '--no-inspect-brk',
    '--no-inspect-wait'
  ]) {
    if (process.allowedNodeEnvironmentFlags.has(flag)) result.push(flag)
  }

  return result
}
