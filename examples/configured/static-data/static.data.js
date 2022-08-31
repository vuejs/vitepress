import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  watch: ['./data/*'],
  async load() {
    const foo = fs.readFileSync(
      path.resolve(dirname, './data/foo.json'),
      'utf-8'
    )
    const bar = fs.readFileSync(
      path.resolve(dirname, './data/bar.json'),
      'utf-8'
    )
    return [JSON.parse(foo), JSON.parse(bar)]
  }
}
