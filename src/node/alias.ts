import path from 'path'
import { Alias, AliasOptions } from 'vite'

const PKG_ROOT = path.join(__dirname, '../../')
export const DIST_CLIENT_PATH = path.join(__dirname, '../client')
export const APP_PATH = path.join(DIST_CLIENT_PATH, 'app')
export const SHARED_PATH = path.join(DIST_CLIENT_PATH, 'shared')
export const DEFAULT_THEME_PATH = path.join(DIST_CLIENT_PATH, 'theme-default')

// special virtual file
// we can't directly import '/@siteData' because
// - it's not an actual file so we can't use tsconfig paths to redirect it
// - TS doesn't allow shimming a module that starts with '/'
export const SITE_DATA_ID = '@siteData'
export const SITE_DATA_REQUEST_PATH = '/' + SITE_DATA_ID

export function resolveAliases(themeDir: string): AliasOptions {
  const paths: Record<string, string> = {
    '/@theme': themeDir,
    '/@shared': SHARED_PATH,
    [SITE_DATA_ID]: SITE_DATA_REQUEST_PATH
  }

  const aliases: Alias[] = [
    ...Object.keys(paths).map((p) => ({
      find: p,
      replacement: paths[p]
    })),
    {
      find: /^vitepress$/,
      replacement: path.join(__dirname, '../client/index')
    },
    {
      find: /^vitepress\/theme$/,
      replacement: path.join(__dirname, '../client/theme-default/index')
    },
    // alias for local linked development
    { find: /^vitepress\//, replacement: PKG_ROOT + '/' },
    // make sure it always use the same vue dependency that comes with
    // vitepress itself
    {
      find: /^vue$/,
      replacement: require.resolve('vue/dist/vue.runtime.esm-bundler.js')
    }
  ]

  return aliases
}
