import ora from 'ora'
import humanizeDuration from 'humanize-duration'

export const okMark = '\x1b[32m✓\x1b[0m'
export const failMark = '\x1b[31m✖\x1b[0m'

export type UpdateHandle = (done: number, total?: number) => any

export async function task<T>(
  taskName: string,
  task: (update: UpdateHandle) => Promise<T>
): Promise<T> {
  const spinner = ora({ discardStdin: false })
  spinner.start(taskName + '...')

  const updateHandle: UpdateHandle = (done, total) => {
    if (total === undefined) {
      spinner.text = `${taskName} [ ${done} ]`
    } else {
      // match length to display them in same width
      const _total = `${total}`
      const _done = `${done}`.padStart(_total.length, ' ')
      spinner.text = `${taskName} [ ${_done} / ${_total} ]`
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
    const timeEnd = performance.now()
    const duration = humanizeDuration(timeEnd - timeStart, {
      maxDecimalPoints: 2
    })
    const text = `${taskName} - ${duration}`
    const symbol = success ? okMark : failMark
    spinner.stopAndPersist({ symbol, text })
  }
}
