import ora from 'ora'
import humanizeDuration from 'humanize-duration'

export const okMark = '\x1b[32m✓\x1b[0m'
export const failMark = '\x1b[31m✖\x1b[0m'

export async function task(taskName: string, task: () => Promise<void>) {
  const spinner = ora({ discardStdin: false })
  spinner.start(taskName + '...')

  let symbol = okMark
  const timeStart = performance.now()

  try {
    await task()
  } catch (e) {
    symbol = failMark
    throw e
  } finally {
    const timeEnd = performance.now()
    const duration = humanizeDuration(timeEnd - timeStart, {
      maxDecimalPoints: 2
    })
    const text = `${taskName} - ${duration}`
    spinner.stopAndPersist({ symbol, text })
  }
}
