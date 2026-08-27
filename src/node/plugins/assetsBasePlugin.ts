import type { Plugin, UserConfig as ViteUserConfig } from 'vite'

import type { SiteConfig } from '../config'

export type RenderBuiltUrl = NonNullable<
  NonNullable<ViteUserConfig['experimental']>['renderBuiltUrl']
>

/**
 * Routes built asset URLs through `assetsBase` via Vite's renderBuiltUrl,
 * chaining behind any user-provided hook. Only plain-string returns are
 * produced: {runtime} would poison the SSR bundle that pre-renders pages
 * (it executes at module scope in Node) and errors in CSS.
 */
export function assetsBasePlugin(config: SiteConfig): Plugin {
  return {
    name: 'vitepress:assets-base',
    // post + appended last: the config hook must run after every user
    // plugin so it chains behind (not under) their renderBuiltUrl
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
