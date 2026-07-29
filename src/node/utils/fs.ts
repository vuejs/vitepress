import { readFile as fsReadFile } from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'

const retryCodes = new Set(['EMFILE', 'ENFILE'])

/**
 * Reads a file as utf8, retrying with backoff when the process is
 * temporarily out of file descriptors (EMFILE/ENFILE).
 */
export async function readFile(file: string): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fsReadFile(file, 'utf8')
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code
      if (attempt >= 9 || !code || !retryCodes.has(code)) throw e
      await setTimeout(2 ** attempt * 10)
    }
  }
}
