import ora from 'ora'
import humanizeDuration from 'humanize-duration'
import c from 'picocolors'

export const okMark = c.green('✓')
export const failMark = c.red('✖')

export type UpdateHandle = (
  done?: number,
  total?: number,
  subtask?: string
) => any

let updateHandle: UpdateHandle | null = null

export const updateCurrentTask: UpdateHandle = (...args) => {
  updateHandle?.(...args)
}

export async function task<T>(
  taskName: string,
  task: (update: UpdateHandle) => Promise<T>
): Promise<T> {
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
