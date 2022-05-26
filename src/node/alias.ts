import { createRequire } from 'module'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'
import { Alias, AliasOptions } from 'vite'

const require = createRequire(import.meta.url)
const PKG_ROOT = resolve(fileURLToPath(import.meta.url), '../..')
export const DIST_CLIENT_PATH = resolve(PKG_ROOT, 'client')
export const APP_PATH = join(DIST_CLIENT_PATH, 'app')
export const SHARED_PATH = join(DIST_CLIENT_PATH, 'shared')
export const DEFAULT_THEME_PATH = join(DIST_CLIENT_PATH, 'theme-default')

// special virtual file
// we can't directly import '/@siteData' because
// - it's not an actual file so we can't use tsconfig paths to redirect it
// - TS doesn't allow shimming a module that starts with '/'
export const SITE_DATA_ID = '@siteData'
export const SITE_DATA_REQUEST_PATH = '/' + SITE_DATA_ID

const vueRuntimePath = 'vue/dist/vue.runtime.esm-bundler.js'

export function resolveAliases(root: string, themeDir: string): AliasOptions {
  const paths: Record<string, string> = {
    '/@theme': themeDir,
    '@theme': themeDir,
    [SITE_DATA_ID]: SITE_DATA_REQUEST_PATH
  }

  // prioritize vue installed in project root and fallback to
  // vue that comes with vitepress itself.
  let vuePath
  try {
    vuePath = require.resolve(vueRuntimePath, { paths: [root] })
  } catch (e) {
    vuePath = require.resolve(vueRuntimePath)
  }

  const aliases: Alias[] = [
    ...Object.keys(paths).map((p) => ({
      find: p,
      replacement: paths[p]
    })),
    {
      find: /^vitepress$/,
      replacement: join(DIST_CLIENT_PATH, '/index')
    },
    {
      find: /^vitepress\/theme$/,
      replacement: join(DIST_CLIENT_PATH, '/theme-default/index')
    },
    // alias for local linked development
    { find: /^vitepress\//, replacement: PKG_ROOT + '/' },
    // make sure it always use the same vue dependency that comes with
    // vitepress itself
    {
      find: /^vue$/,
      replacement: vuePath
    }
  ]

  return aliases
}
