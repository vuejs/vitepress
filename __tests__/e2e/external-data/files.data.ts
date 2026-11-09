import { readFile } from 'node:fs/promises'

export default {
  watch: '../../fixtures/external-data/**/*.json',
  async load(files: string[]) {
    return Promise.all(
      files.map(async (file) => JSON.parse(await readFile(file, 'utf-8')))
    )
  }
}
