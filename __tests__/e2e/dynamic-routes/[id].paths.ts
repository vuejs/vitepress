import { defineRoutes } from 'vitepress'
import paths from './paths'

export default defineRoutes({
  async paths(watchedFiles: string[]) {
    // console.log('watchedFiles', watchedFiles)
    return paths
  },
  watch: ['../data-loading/**/*.json'],
  async transformPageData(pageData) {
    // console.log('transformPageData', pageData.filePath)
    pageData.title += ' - transformed'
  }
})
