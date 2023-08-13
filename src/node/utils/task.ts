import ora from 'ora'

export const okMark = '\x1b[32m✓\x1b[0m'
export const failMark = '\x1b[31m✖\x1b[0m'

export async function task(taskName: string, task: () => Promise<void>) {
  const spinner = ora({ discardStdin: false })
  spinner.start(taskName + '...')

  try {
    await task()
  } catch (e) {
    spinner.stopAndPersist({ symbol: failMark })
    throw e
  }

  spinner.stopAndPersist({ symbol: okMark })
}
