// TODO figure out why it causes full page reload

import { Plugin, ViteDevServer, loadConfigFromFile, normalizePath } from 'vite'
import { dirname, resolve } from 'path'
import { isMatch } from 'micromatch'

const loaderMatch = /\.data\.(j|t)s$/

let server: ViteDevServer

interface LoaderModule {
  watch: string[] | string | undefined
  load: () => any
}

interface CachedLoaderModule {
  pattern: string[] | undefined
  loader: () => any
}

const idToLoaderModulesMap: Record<string, CachedLoaderModule | undefined> =
  Object.create(null)

// During build, the load hook will be called on the same file twice
// once for client and once for server build. Not only is this wasteful, it
// also leads to a race condition in loadConfigFromFile() that results in an
// fs unlink error. So we reuse the same Promise during build to avoid double
// loading.
let idToPendingPromiseMap: Record<string, Promise<string> | undefined> =
  Object.create(null)
let isBuild = false

export const staticDataPlugin: Plugin = {
  name: 'vitepress:data',

  configResolved(config) {
    isBuild = config.command === 'build'
  },

  configureServer(_server) {
    server = _server
  },

  async load(id) {
    if (loaderMatch.test(id)) {
      let _resolve: ((res: any) => void) | undefined
      if (isBuild) {
        if (idToPendingPromiseMap[id]) {
          return idToPendingPromiseMap[id]
        }
        idToPendingPromiseMap[id] = new Promise((r) => {
          _resolve = r
        })
      }

      const base = dirname(id)
      let pattern: string[] | undefined
      let loader: () => any

      const existing = idToLoaderModulesMap[id]
      if (existing) {
        ;({ pattern, loader } = existing)
      } else {
        // use vite's load config util as a away to load Node.js file with
        // TS & native ESM support
        const loaderModule = (await loadConfigFromFile({} as any, id))
          ?.config as LoaderModule
        pattern =
          typeof loaderModule.watch === 'string'
            ? [loaderModule.watch]
            : loaderModule.watch
        if (pattern) {
          pattern = pattern.map((p) => {
            return p.startsWith('.')
              ? normalizePath(resolve(base, p))
              : normalizePath(p)
          })
          console.log(pattern)
        }
        loader = loaderModule.load
      }

      // load the data
      const data = await loader()

      // record loader module for HMR
      if (server) {
        idToLoaderModulesMap[id] = { pattern, loader }
      }

      const result = `export const data = JSON.parse(${JSON.stringify(
        JSON.stringify(data)
      )})`

      if (_resolve) _resolve(result)
      return result
    }
  },

  transform(_code, id) {
    if (server && loaderMatch.test(id)) {
      // register this module as a glob importer
      const { pattern } = idToLoaderModulesMap[id]!
      ;(server as any)._importGlobMap.set(id, [pattern])
    }
    return null
  },

  handleHotUpdate(ctx) {
    for (const id in idToLoaderModulesMap) {
      const { pattern } = idToLoaderModulesMap[id]!
      const isLoaderFile = normalizePath(ctx.file) === id
      if (isLoaderFile) {
        // invalidate loader file
        delete idToLoaderModulesMap[id]
      }
      if (pattern) {
        console.log(pattern, isMatch(ctx.file, pattern))
      }
      if (isLoaderFile || (pattern && isMatch(ctx.file, pattern))) {
        ctx.modules.push(server.moduleGraph.getModuleById(id)!)
      }
    }
  }
}
