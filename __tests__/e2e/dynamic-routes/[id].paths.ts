import type { PageData } from 'client/shared'
import paths from './paths'

export default {
  async paths(watchedFiles: string[]) {
    console.log('watchedFiles', watchedFiles)
    return paths
  },
  watch: ['**/data-loading/**/*.json'],
  async transformPageData(pageData: PageData) {
    console.log('transformPageData', pageData.filePath)
    pageData.title += ' - transformed'
  }
}
