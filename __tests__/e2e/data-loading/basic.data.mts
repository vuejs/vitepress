import fs from 'node:fs'
import { defineLoader } from 'vitepress'

type Data = Record<string, boolean>[]
export declare const data: Data

export default defineLoader({
  watch: ['./data/*'],
  async load(files: string[]): Promise<Data> {
    const data: Data = []
    for (const file of files.sort().filter((file) => file.endsWith('.json'))) {
      data.push(JSON.parse(fs.readFileSync(file, 'utf-8')))
    }
    return data
  }
})
