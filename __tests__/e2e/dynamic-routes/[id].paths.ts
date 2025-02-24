import paths from './paths'

export default {
  async paths(watchedFiles: string[]) {
    // console.log('watchedFiles', watchedFiles)
    return paths
  },
  watch: ['**/data-loading/**/*.json']
}
