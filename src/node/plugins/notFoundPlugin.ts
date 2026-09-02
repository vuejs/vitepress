import path from 'node:path'

import { normalizePath, type Plugin } from 'vite'

import { APP_PATH } from '../alias'
import type { SiteConfig } from '../siteConfig'
import { isExternal, slash, type SiteData } from '../shared'

const notFoundRE = /(?:^|\/)404\.md(?:\?|$)/

// the re-export module is plain js under a `.md` id, which keeps it a page
// chunk; the virtual-module marker keeps the markdown and sfc transforms off
// it (both skip `\0` ids)
const VIRTUAL_PREFIX = '\0'

/**
 * The not-found page of every locale, as output-relative paths: `404.md`
 * for the root plus `<locale>/404.md` for each locale directory.
 */
export function resolveNotFoundPagePaths(site: SiteData): string[] {
  const dirs = Object.keys(site.locales ?? {}).filter(
    (key) => key !== 'root' && !isExternal(key)
  )
  return ['404.md', ...dirs.map((dir) => `${dir}/404.md`)]
}

/**
 * Backs every not-found page with a module. A page the author wrote loads
 * as-is; the others are synthesized here so the router, the build and the
 * preview server can treat the not-found page like any page:
 *
 * - a locale without its own file re-exports the root `404.md`, keeping the
 *   locale in its page data
 * - with no file at all, a markdown page renders the theme's `NotFound`
 *   component
 */
export const notFoundPlugin = (siteConfig: SiteConfig): Plugin => {
  const { srcDir } = siteConfig

  const splitQuery = (id: string): [file: string, query: string] => {
    const index = id.indexOf('?')
    return index === -1 ? [id, ''] : [id.slice(0, index), id.slice(index + 1)]
  }

  // the synthesized page a would-be file stands for, and the authored root
  // page it inherits when there is one
  const virtualPage = (file: string) => {
    const relativePath = slash(
      path.relative(srcDir, file.replace(VIRTUAL_PREFIX, ''))
    )
    // an authored page that a rewrite moves elsewhere still owns its file
    if (siteConfig.pages.includes(relativePath)) return
    const page = siteConfig.notFoundPages.find((p) => p.path === relativePath)
    if (!page || page.source != null) return
    const root = siteConfig.notFoundPages.find((p) => p.path === '404.md')
    const inherits = page.path !== '404.md' ? (root?.source ?? null) : null
    return { path: page.path, inherits }
  }

  return {
    name: 'vitepress:not-found',
    enforce: 'pre',

    resolveId: {
      filter: { id: notFoundRE },
      handler(id, importer) {
        const [file, query] = splitQuery(id)
        // sub-requests (`?vue&type=…`) belong to the module that owns them
        if (query && !/^t=\d+$/.test(query)) return
        const resolved = file.startsWith(srcDir)
          ? file
          : file.startsWith('/')
            ? normalizePath(path.join(srcDir, file))
            : importer && file.startsWith('.')
              ? normalizePath(path.resolve(path.dirname(importer), file))
              : undefined
        const page = resolved && virtualPage(resolved)
        if (page) return page.inherits ? VIRTUAL_PREFIX + resolved : resolved
      }
    },

    load: {
      filter: { id: notFoundRE },
      handler(id) {
        const [file, query] = splitQuery(id)
        if (query) return
        const page = virtualPage(file)
        if (!page) return

        if (page.inherits) {
          const source = normalizePath(path.resolve(srcDir, page.inherits))
          return [
            `import Root, { __pageData as base } from ${JSON.stringify(source)}`,
            `export * from ${JSON.stringify(source)}`,
            `export default Root`,
            `export const __pageData = { ...base, relativePath: ${JSON.stringify(page.path)} }`
          ].join('\n')
        }

        const helper = normalizePath(path.join(APP_PATH, 'theme.js'))
        return [
          '---',
          'title: "404"',
          'description: Not Found',
          '---',
          '',
          '<script setup>',
          `import RawTheme from '@theme/index'`,
          `import { resolveNotFound } from ${JSON.stringify(helper)}`,
          '',
          'const NotFound = resolveNotFound(RawTheme)',
          '</script>',
          '',
          '<NotFound />',
          ''
        ].join('\n')
      }
    }
  }
}
