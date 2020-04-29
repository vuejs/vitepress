import path from 'path'
import { Resolver } from "vite"

// built ts files are placed into /dist
export const APP_PATH = path.join(__dirname, '../../lib/app')

// speical virtual file
export const SITE_DATA_REQUEST_PATH = '/@siteData'

// this is a path resolver that is passed to vite
// so that we can resolve custom requests that start with /@app or /@theme
// we also need to map file paths back to their public served paths so that
// vite HMR can send the correct update notifications to the client.
export function createResolver(themePath: string): Resolver {
  return {
    requestToFile(publicPath) {
      if (publicPath.startsWith('/@app')) {
        return path.join(APP_PATH, publicPath.replace(/^\/@app\/?/, ''))
      }
      if (publicPath.startsWith('/@theme')) {
        return path.join(themePath, publicPath.replace(/^\/@theme\/?/, ''))
      }
      if (publicPath === SITE_DATA_REQUEST_PATH) {
        return SITE_DATA_REQUEST_PATH
      }
    },
    fileToRequest(filePath) {
      if (filePath.startsWith(APP_PATH)) {
        return `/@app/${path.relative(APP_PATH, filePath)}`
      }
      if (filePath.startsWith(themePath)) {
        return `/@theme/${path.relative(themePath, filePath)}`
      }
      if (filePath === SITE_DATA_REQUEST_PATH) {
        return SITE_DATA_REQUEST_PATH
      }
    },
    idToRequest(id) {
      if (id === 'vitepress') {
        return '/@app/exports.js'
      }
    }
  }
}
