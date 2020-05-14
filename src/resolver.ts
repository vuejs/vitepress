import path from 'path'
import { Resolver } from 'vite'

// built ts files are placed into /dist
export const APP_PATH = path.join(__dirname, '../lib/app')

// special virtual file
// we can't directly import '/@siteData' becase
// - it's not an actual file so we can't use tsconfig paths to redirect it
// - TS doesn't allow shimming a module that starts with '/'
export const SITE_DATA_ID = '@siteData'
export const SITE_DATA_REQUEST_PATH = '/' + SITE_DATA_ID

// this is a path resolver that is passed to vite
// so that we can resolve custom requests that start with /@app or /@theme
// we also need to map file paths back to their public served paths so that
// vite HMR can send the correct update notifications to the client.
export function createResolver(themeDir: string): Resolver {
  return {
    requestToFile(publicPath) {
      if (publicPath.startsWith('/@app')) {
        return path.join(APP_PATH, publicPath.replace(/^\/@app\/?/, ''))
      }
      if (publicPath.startsWith('/@theme')) {
        return path.join(themeDir, publicPath.replace(/^\/@theme\/?/, ''))
      }
      if (publicPath === SITE_DATA_REQUEST_PATH) {
        return SITE_DATA_REQUEST_PATH
      }
    },
    fileToRequest(filePath) {
      if (filePath.startsWith(APP_PATH)) {
        return `/@app/${path.relative(APP_PATH, filePath)}`
      }
      if (filePath.startsWith(themeDir)) {
        return `/@theme/${path.relative(themeDir, filePath)}`
      }
      if (filePath === SITE_DATA_REQUEST_PATH) {
        return SITE_DATA_REQUEST_PATH
      }
    },
    alias(id) {
      if (id === 'vitepress') {
        return '/@app/exports.js'
      }
      if (id === SITE_DATA_ID) {
        return SITE_DATA_REQUEST_PATH
      }
    }
  }
}
