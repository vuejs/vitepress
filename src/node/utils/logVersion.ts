import c from 'picocolors'
import { version as viteVersion, type Logger } from 'vite'
import { version } from '../../../package.json'

export function logVersion(logger: Logger) {
  logger.info(
    `\n  ${c.green(`${c.bold('vitepress')} ${version}`)}  ${c.gray(`(using vite ${viteVersion})`)}\n`,
    { clear: !logger.hasWarned }
  )
}
