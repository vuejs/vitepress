import path from 'path'
import { Resolver } from "vite"

// built ts files are placed into /dist
export const APP_PATH = path.join(__dirname, '../../lib/app')
// TODO detect user configured theme
export const THEME_PATH = path.join(__dirname, '../../lib/theme-default')

export const VitePressResolver: Resolver = {
  publicToFile(publicPath) {
    if (publicPath.startsWith('/@app')) {
      return path.join(APP_PATH, publicPath.replace(/^\/@app\/?/, ''))
    }
    if (publicPath.startsWith('/@theme')) {
      return path.join(THEME_PATH, publicPath.replace(/^\/@theme\/?/, ''))
    }
  },
  fileToPublic(filePath) {
    if (filePath.startsWith(APP_PATH)) {
      return `/@app/${path.relative(APP_PATH, filePath)}`
    }
    if (filePath.startsWith(THEME_PATH)) {
      return `/@theme/${path.relative(THEME_PATH, filePath)}`
    }
  }
}
