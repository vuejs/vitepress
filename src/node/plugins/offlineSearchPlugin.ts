import fs from 'node:fs'
import type { Plugin } from 'vite'
import chokidar from 'chokidar'
import Flexsearch from '@akryum/flexsearch-es'
// @ts-ignore
import en from '@akryum/flexsearch-es/src/lang/en.js'
// @ts-ignore
import latin from '@akryum/flexsearch-es/src/lang/latin/advanced.js'
import type { UserConfig } from '../config'

const OFFLINE_SEARCH_INDEX_ID = '@offline-search-index'
const OFFLINE_SEARCH_INDEX_REQUEST_PATH = '/' + OFFLINE_SEARCH_INDEX_ID

let searchIndexData: any = {}

export const offlineSearchPlugin = (): Plugin => ({
  name: 'vitepress:offline-search',

  resolveId(id) {
    if (id === OFFLINE_SEARCH_INDEX_ID) {
      return OFFLINE_SEARCH_INDEX_REQUEST_PATH
    }
  },

  async load(id) {
    if (id === OFFLINE_SEARCH_INDEX_REQUEST_PATH) {
      return `export default ${JSON.stringify(searchIndexData)}`
    }
  }
})


async function generateSearchIndexData (userConfig: UserConfig) {
  const watcher = chokidar.watch(['**.md'], {
    cwd: userConfig.srcDir,
    ignored: ['**/node_modules', ...(userConfig.srcExclude || [])],
    ignoreInitial: false,
  })

  const index = Flexsearch.create({
    
  })

  watcher.on('add', file => {
    const content = fs.readFileSync(file, 'utf-8')
  })

  await new Promise<void>(resolve => {
    watcher.once('ready', () => resolve())
  })
}
