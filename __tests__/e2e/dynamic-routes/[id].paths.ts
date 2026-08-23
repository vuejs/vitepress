import { defineRoutes } from 'vitepress'

import paths from './paths'

export default defineRoutes({
  async paths(_watchedFiles: string[]) {
    // console.log('watchedFiles', _watchedFiles)
    return paths
  },
  watch: ['../data-loading/**/*.json'],
  async transformPageData(pageData) {
    // console.log('transformPageData', pageData.filePath)
    pageData.title += ' - transformed'
  }
})
