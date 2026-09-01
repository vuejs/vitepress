import type { Plugin } from 'vite'

import type { SiteConfig } from '../config'

/**
 * Routes built asset URLs through `assetsBase`, chaining behind any user
 * renderBuiltUrl. Plain strings only: a `{ runtime }` return would execute
 * at module scope in the Node SSR bundle, and is an error in CSS.
 */
export function assetsBasePlugin(config: SiteConfig): Plugin {
  return {
    name: 'vitepress:assets-base',
    // 'post', plus a position after the user plugins in plugin.ts: the
    // config hook must run after theirs to chain behind (not under) their
    // renderBuiltUrl
    enforce: 'post',
    config(userConfig, env) {
      if (env.command !== 'build') return
      const userHook = userConfig.experimental?.renderBuiltUrl
      return {
        experimental: {
          renderBuiltUrl(filename, ctx) {
            const userResult = userHook?.(filename, ctx)
            if (userResult !== undefined) return userResult
            if (ctx.type === 'asset') return config.assetsBase! + filename
          }
        }
      }
    }
  }
}
