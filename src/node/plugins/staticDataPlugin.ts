import path from 'node:path'
import pm from 'picomatch'
import {
  loadConfigFromFile,
  normalizePath,
  type EnvironmentModuleNode,
  type Plugin,
  type ViteDevServer
} from 'vite'
import type { Awaitable } from '../shared'
import { glob, normalizeGlob, type GlobOptions } from '../utils/glob'

const loaderMatch = /\.data\.m?(j|t)s($|\?)/

let server: ViteDevServer

// Map from loader module id to its module info
const idToLoaderModulesMap: Record<
  string,
  (Required<Omit<LoaderModule, 'watch'>> & { watch: string[] }) | undefined
> = Object.create(null)

// Map from dependency file to a set of loader module ids
const depToLoaderModuleIdsMap: Record<string, Set<string>> = Object.create(null)

// During build, the load hook will be called on the same file twice
// once for client and once for server build. Not only is this wasteful, it
// also leads to a race condition in loadConfigFromFile() that results in an
// fs unlink error. So we reuse the same Promise during build to avoid double
// loading.
let idToPendingPromiseMap: Record<string, Promise<string> | undefined> =
  Object.create(null)
let isBuild = false

export interface LoaderModule<T = any> {
  watch?: string[] | string
  load: (watchedFiles: string[]) => Awaitable<T>
  options?: { globOptions?: GlobOptions }
}

/**
 * Helper for defining loaders with type inference
 */
export function defineLoader<T>(loader: LoaderModule<T>): LoaderModule<T> {
  return loader
}

export const staticDataPlugin: Plugin = {
  name: 'vitepress:data',

  configResolved(config) {
    isBuild = config.command === 'build'
  },

  configureServer(_server) {
    server = _server
  },

  load: {
    filter: { id: loaderMatch },
    handler(id) {
      if (isBuild) return (idToPendingPromiseMap[id] ??= loadData(id))
      return loadData(id)
    }
  },

  hotUpdate({ file, modules: existingMods }) {
    if (this.environment.name !== 'client') return

    const modules: EnvironmentModuleNode[] = []
    const normalizedFile = normalizePath(file)

    // Trigger update if a dependency (including transitive ones) changed.
    if (normalizedFile in depToLoaderModuleIdsMap) {
      for (const id of Array.from(
        depToLoaderModuleIdsMap[normalizedFile] || []
      )) {
        delete idToLoaderModulesMap[id]
        const mod = this.environment.moduleGraph.getModuleById(id)
        if (mod) modules.push(mod)
      }
    }

    // Also check if the file matches any custom watch patterns.
    for (const id in idToLoaderModulesMap) {
      const loader = idToLoaderModulesMap[id]
      if (
        loader?.watch?.length &&
        pm(loader.watch, loader.options.globOptions)(normalizedFile)
      ) {
        const mod = this.environment.moduleGraph.getModuleById(id)
        if (mod) modules.push(mod)
      }
    }

    return modules.length ? [...existingMods, ...modules] : undefined
  }
}

async function loadData(id: string): Promise<string> {
  const base = path.dirname(id)
  let watch: LoaderModule['watch']
  let load: LoaderModule['load']
  let options: LoaderModule['options']

  const existing = idToLoaderModulesMap[id]
  if (existing) {
    ;({ watch, load, options } = existing)
  } else {
    // use vite's load config util as a way to load Node.js file with
    // TS & native ESM support
    const res = await loadConfigFromFile({} as any, id.replace(/\?.*$/, ''))

    // record deps for hmr
    if (server && res) {
      for (const dep of res.dependencies) {
        const depPath = normalizePath(path.resolve(dep))
        if (!depToLoaderModuleIdsMap[depPath]) {
          depToLoaderModuleIdsMap[depPath] = new Set()
        }
        depToLoaderModuleIdsMap[depPath].add(id)
      }
    }

    const loaderModule = res?.config as LoaderModule
    watch = normalizeGlob(loaderModule.watch, base)
    load = loaderModule.load
    options = loaderModule.options || {}
  }

  // load the data
  const watchedFiles = await glob(watch, {
    absolute: true,
    ...options.globOptions
  })
  const data = await load(watchedFiles)

  // record loader module for HMR
  if (server) idToLoaderModulesMap[id] = { watch, load, options }

  return `export const data = JSON.parse(${JSON.stringify(JSON.stringify(data))})`
}
