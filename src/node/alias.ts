import path from 'path'
import { AliasOptions } from 'vite'
import { UserConfig } from './config'

export const APP_PATH = path.join(__dirname, '../client/app')
export const SHARED_PATH = path.join(__dirname, '../client/shared')
export const DEFAULT_THEME_PATH = path.join(
  __dirname,
  '../client/theme-default'
)

// special virtual file
// we can't directly import '/@siteData' because
// - it's not an actual file so we can't use tsconfig paths to redirect it
// - TS doesn't allow shimming a module that starts with '/'
export const SITE_DATA_ID = '@siteData'
export const SITE_DATA_REQUEST_PATH = '/' + SITE_DATA_ID

// this is a path resolver that is passed to vite
// so that we can resolve custom requests that start with /@app or /@theme
// we also need to map file paths back to their public served paths so that
// vite HMR can send the correct update notifications to the client.
export function createAlias(
  themeDir: string,
  userConfig: UserConfig
): AliasOptions {
  return {
    ...userConfig.alias,
    '/@app': APP_PATH,
    '/@theme': themeDir,
    '/@default-theme': DEFAULT_THEME_PATH,
    '/@shared': SHARED_PATH,
    vitepress: `${APP_PATH}/exports.js`,
    [SITE_DATA_ID]: SITE_DATA_REQUEST_PATH
  }
}
