import path from 'path'
import { Resolver } from 'vite'
import { UserConfig } from './config'

export const APP_PATH = path.join(__dirname, '../client/app')
export const SHARED_PATH = path.join(__dirname, '../client/shared')

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
export function createResolver(
  themeDir: string,
  userConfig: UserConfig
): Resolver {
  return {
    alias: {
      ...userConfig.alias,
      '/@app/': APP_PATH,
      '/@theme/': themeDir,
      '/@shared/': SHARED_PATH,
      vitepress: '/@app/exports.js',
      [SITE_DATA_ID]: SITE_DATA_REQUEST_PATH
    },
    requestToFile(publicPath) {
      if (publicPath === SITE_DATA_REQUEST_PATH) {
        return SITE_DATA_REQUEST_PATH
      }
    },
    fileToRequest(filePath) {
      if (filePath === SITE_DATA_REQUEST_PATH) {
        return SITE_DATA_REQUEST_PATH
      }
    }
  }
}
