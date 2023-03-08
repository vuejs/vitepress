import {
  type Plugin,
  type ViteDevServer,
  loadConfigFromFile,
  normalizePath
} from 'vite'
import path, { dirname, resolve } from 'path'
import { isMatch } from 'micromatch'
import glob from 'fast-glob'

const loaderMatch = /\.data\.(j|t)s$/

let server: ViteDevServer

export interface LoaderModule {
  watch?: string[] | string
  load: (watchedFiles: string[]) => any
}

/**
 * Helper for defining loaders with type inference
 */
export function defineLoader(loader: LoaderModule) {
  return loader
}

const idToLoaderModulesMap: Record<string, LoaderModule | undefined> =
  Object.create(null)

const depToLoaderModuleIdMap: Record<string, string> = Object.create(null)

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
      let watch: LoaderModule['watch']
      let load: LoaderModule['load']

      const existing = idToLoaderModulesMap[id]
      if (existing) {
        ;({ watch, load } = existing)
      } else {
        // use vite's load config util as a away to load Node.js file with
        // TS & native ESM support
        const res = await loadConfigFromFile({} as any, id)

        // record deps for hmr
        if (server && res) {
          for (const dep of res.dependencies) {
            depToLoaderModuleIdMap[normalizePath(path.resolve(dep))] = id
          }
        }

        const loaderModule = res?.config as LoaderModule
        watch =
          typeof loaderModule.watch === 'string'
            ? [loaderModule.watch]
            : loaderModule.watch
        if (watch) {
          watch = watch.map((p) => {
            return p.startsWith('.')
              ? normalizePath(resolve(base, p))
              : normalizePath(p)
          })
        }
        load = loaderModule.load
      }

      // load the data
      let watchedFiles
      if (watch) {
        watchedFiles = (
          await glob(watch, {
            ignore: ['**/node_modules/**', '**/dist/**']
          })
        ).sort()
      }
      const data = await load(watchedFiles || [])

      // record loader module for HMR
      if (server) {
        idToLoaderModulesMap[id] = { watch, load }
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
      const { watch } = idToLoaderModulesMap[id]!
      if (watch) {
        ;(server as any)._importGlobMap.set(id, [
          Array.isArray(watch) ? watch : [watch]
        ])
      }
    }
    return null
  },

  handleHotUpdate(ctx) {
    const file = ctx.file

    // dependency of data loader changed
    // (note the dep array includes the loader file itself)
    if (file in depToLoaderModuleIdMap) {
      const id = depToLoaderModuleIdMap[file]!
      delete idToLoaderModulesMap[id]
      ctx.modules.push(server.moduleGraph.getModuleById(id)!)
    }

    for (const id in idToLoaderModulesMap) {
      const { watch } = idToLoaderModulesMap[id]!
      if (watch && isMatch(file, watch)) {
        ctx.modules.push(server.moduleGraph.getModuleById(id)!)
      }
    }
  }
}
