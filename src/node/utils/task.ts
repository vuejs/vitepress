import ora from 'ora'
import humanizeDuration from 'humanize-duration'
import c from 'picocolors'
import { workerMeta } from '../worker'

export const okMark = c.green('✓')
export const failMark = c.red('✖')
export const clearLine = '\x1b[2K\r'

export type UpdateHandle = (
  done?: number,
  total?: number,
  subtask?: string
) => any

let updateHandle: UpdateHandle | null = null

export const updateCurrentTask: UpdateHandle = (...args) => {
  if (workerMeta) workerMeta.updateCurrentTask(...args)
  else if (updateHandle) updateHandle(...args)
  else if (!process.stderr.isTTY) {
    return
  } else if (args.length === 0) {
    process.stderr.write(clearLine)
  } else {
    const name = args[2] || 'unknown task'
    process.stderr.write(
      `${clearLine}${name} [${args.slice(0, 2).join(' / ')}]`
    )
  }
}

export async function task<T>(
  taskName: string,
  task: (update: UpdateHandle) => Promise<T>
): Promise<T> {
  if (workerMeta) {
    let retVal: T
    await workerMeta.task(taskName, async (handle: UpdateHandle) => {
      retVal = await task(handle)
    })
    return retVal!
  }

  const spinner = ora({ discardStdin: false })
  spinner.start(taskName + '...')

  updateHandle = (done, total, subtask) => {
    const taskFullName = subtask ? `${taskName} - ${subtask}` : taskName
    if (done === undefined) {
      spinner.text = taskFullName + '...'
    } else if (total === undefined) {
      spinner.text = `${taskFullName} [ ${done} ]`
    } else {
      // match length to display them in same width
      const _total = `${total}`
      const _done = `${done}`.padStart(_total.length, ' ')
      spinner.text = `${taskFullName} [ ${_done} / ${_total} ]`
    }
  }

  const timeStart = performance.now()
  let success = true

  try {
    return await task(updateHandle)
  } catch (e) {
    success = false
    throw e
  } finally {
    updateHandle = null
    const timeEnd = performance.now()
    const duration = humanizeDuration(timeEnd - timeStart, {
      maxDecimalPoints: 2
    })
    const text = `${taskName} - ${duration}`
    const symbol = success ? okMark : failMark
    spinner.stopAndPersist({ symbol, text })
  }
}
