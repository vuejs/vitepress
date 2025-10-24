import fs from 'fs-extra'
import path from 'node:path'
import c from 'picocolors'
import pm from 'picomatch'
import {
  loadConfigFromFile,
  normalizePath,
  type EnvironmentModuleGraph,
  type EnvironmentModuleNode,
  type Logger,
  type Plugin
} from 'vite'
import type { Awaitable } from '../shared'
import { type SiteConfig, type UserConfig } from '../siteConfig'
import { glob, normalizeGlob, type GlobOptions } from '../utils/glob'
import { ModuleGraph } from '../utils/moduleGraph'
import { resolveRewrites } from './rewritesPlugin'

interface UserRouteConfig {
  params: Record<string, string>
  content?: string
}

export type ResolvedRouteConfig = UserRouteConfig & {
  /**
   * the raw route (relative to src root), e.g. foo/[bar].md
   */
  route: string
  /**
   * the actual path with params resolved (relative to src root), e.g. foo/1.md
   */
  path: string
  /**
   * absolute fs path
   */
  fullPath: string
  /**
   * the path to the paths loader module
   */
  loaderPath: string
}

export interface RouteModule {
  watch?: string[] | string
  paths:
    | UserRouteConfig[]
    | ((watchedFiles: string[]) => Awaitable<UserRouteConfig[]>)
  transformPageData?: UserConfig['transformPageData']
  options?: { globOptions?: GlobOptions }
}

interface ResolvedRouteModule {
  watch: string[]
  routes?: ResolvedRouteConfig[]
  loader: RouteModule['paths']
  transformPageData?: RouteModule['transformPageData']
  options: NonNullable<RouteModule['options']>
}

const dynamicRouteRE = /\[(\w+?)\]/g
const pathLoaderRE = /\.paths\.m?[jt]s$/

const routeModuleCache = new Map<string, ResolvedRouteModule>()
let moduleGraph = new ModuleGraph()
let discoveredPages = new Set<string>()

/**
 * Helper for defining routes with type inference
 */
export function defineRoutes(loader: RouteModule): RouteModule {
  return loader
}

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export async function resolvePages(
  siteConfig: Optional<SiteConfig, 'pages' | 'dynamicRoutes' | 'rewrites'>,
  rebuildCache = false
): Promise<void> {
  if (rebuildCache) {
    moduleGraph = new ModuleGraph()
    routeModuleCache.clear()
    discoveredPages.clear()
  }

  const allMarkdownFiles = await glob(['**/*.md'], {
    cwd: siteConfig.srcDir,
    ignore: siteConfig.userConfig.srcExclude
  })

  const pages: string[] = []
  const dynamicRouteFiles: string[] = []

  allMarkdownFiles.forEach((file) => {
    dynamicRouteRE.lastIndex = 0
    ;(dynamicRouteRE.test(file) ? dynamicRouteFiles : pages).push(file)
  })

  const dynamicRoutes = await resolveDynamicRoutes(
    siteConfig.srcDir,
    dynamicRouteFiles,
    siteConfig.logger
  )
  pages.push(...dynamicRoutes.map((r) => r.path))

  const externalDynamicRoutes =
    siteConfig.dynamicRoutes?.filter((r) => !discoveredPages.has(r.path)) || []
  const externalPages =
    siteConfig.pages?.filter((p) => !discoveredPages.has(p)) || []

  const finalDynamicRoutes = [...dynamicRoutes, ...externalDynamicRoutes].sort(
    (a, b) => a.path.localeCompare(b.path)
  )
  const finalPages = [...pages, ...externalPages].sort()

  const rewrites = resolveRewrites(pages, siteConfig.userConfig.rewrites)

  Object.assign(siteConfig, {
    pages: finalPages,
    dynamicRoutes: finalDynamicRoutes,
    rewrites,
    // @ts-expect-error internal flag to reload resolution cache in ../markdownToVue.ts
    __dirty: true
  } satisfies Partial<SiteConfig>)

  discoveredPages = new Set(pages)
}

export const dynamicRoutesPlugin = async (
  config: SiteConfig
): Promise<Plugin> => {
  return {
    name: 'vitepress:dynamic-routes',
    enforce: 'pre',

    resolveId(id) {
      if (!id.endsWith('.md')) return
      const normalizedId = id.startsWith(config.srcDir)
        ? id
        : normalizePath(path.resolve(config.srcDir, id.replace(/^\//, '')))
      const matched = config.dynamicRoutes.find(
        (r) => r.fullPath === normalizedId
      )
      if (matched) return normalizedId
    },

    load(id) {
      const matched = config.dynamicRoutes.find((r) => r.fullPath === id)
      if (matched) {
        const { route, params, content } = matched
        const routeFile = normalizePath(path.resolve(config.srcDir, route))

        moduleGraph.add(id, [routeFile])
        moduleGraph.add(routeFile, [matched.loaderPath])

        let baseContent = fs.readFileSync(routeFile, 'utf-8')

        // inject raw content
        // this is intended for integration with CMS
        // we use a special injection syntax so the content is rendered as
        // static local content instead of included as runtime data.
        if (content) {
          baseContent = baseContent.replace(
            /<!--\s*@content\s*-->/,
            content.replace(/\$/g, '$$$')
          )
        }

        // params are injected with special markers and extracted as part of
        // __pageData in ../markdownToVue.ts
        return `__VP_PARAMS_START${JSON.stringify(params)}__VP_PARAMS_END__${baseContent}`
      }
    },

    async hotUpdate({ file, modules: existingMods }) {
      if (this.environment.name !== 'client') return

      const modules: EnvironmentModuleNode[] = []
      const normalizedFile = normalizePath(file)

      // Trigger update if a module or its dependencies changed.
      modules.push(...getModules(normalizedFile, this.environment.moduleGraph))

      // Also check if the file matches any custom watch patterns.
      let watchedFileChanged = false
      for (const [file, route] of routeModuleCache) {
        if (
          route.watch?.length &&
          pm(route.watch, route.options.globOptions)(normalizedFile)
        ) {
          route.routes = undefined
          watchedFileChanged = true
          modules.push(...getModules(file, this.environment.moduleGraph, false))
        }
      }

      if (
        (modules.length && !normalizedFile.endsWith('.md')) ||
        watchedFileChanged ||
        pathLoaderRE.test(normalizedFile)
      ) {
        // path loader module or deps updated, reset loaded routes
        await resolvePages(config)
      }

      return modules.length ? [...existingMods, ...modules] : undefined
    }
  }
}

export function getPageDataTransformer(
  loaderPath: string
): UserConfig['transformPageData'] | undefined {
  return routeModuleCache.get(loaderPath)?.transformPageData
}

async function resolveDynamicRoutes(
  srcDir: string,
  routes: string[],
  logger: Logger
): Promise<ResolvedRouteConfig[]> {
  const pendingResolveRoutes: Promise<ResolvedRouteConfig[]>[] = []
  const newModuleGraph = moduleGraph.clone()

  for (const route of routes) {
    // locate corresponding route paths file
    const fullPath = normalizePath(path.resolve(srcDir, route))

    const paths = ['js', 'ts', 'mjs', 'mts'].map((ext) =>
      fullPath.replace(/\.md$/, `.paths.${ext}`)
    )

    const pathsFile = paths.find((p) => fs.existsSync(p))

    if (pathsFile == null) {
      logger.warn(
        c.yellow(
          `Missing paths file for dynamic route ${route}: ` +
            `a corresponding ${paths[0]} (or .ts/.mjs/.mts) file is needed.`
        )
      )
      continue
    }

    // load the paths loader module
    let watch: ResolvedRouteModule['watch']
    let loader: ResolvedRouteModule['loader']
    let transformPageData: ResolvedRouteModule['transformPageData']
    let options: ResolvedRouteModule['options']

    const loaderPath = normalizePath(pathsFile)
    const existing = routeModuleCache.get(loaderPath)

    if (existing) {
      // use cached routes if not invalidated by hmr
      if (existing.routes) {
        pendingResolveRoutes.push(Promise.resolve(existing.routes))
        continue
      }

      ;({ watch, loader, transformPageData, options } = existing)
    } else {
      let mod
      try {
        mod = await loadConfigFromFile(
          {} as any,
          pathsFile,
          undefined,
          'silent'
        )
      } catch (err: any) {
        logger.warn(
          `${c.yellow(`Failed to load ${pathsFile}:`)}\n${err.message}\n${err.stack}`
        )
        continue
      }

      if (!mod) {
        logger.warn(
          c.yellow(
            `Invalid paths file export in ${pathsFile}. ` +
              `Missing "default" export.`
          )
        )
        continue
      }

      const loaderModule = mod.config as RouteModule
      watch = normalizeGlob(loaderModule.watch, path.dirname(pathsFile))
      loader = loaderModule.paths
      transformPageData = loaderModule.transformPageData
      options = loaderModule.options || {}

      if (!loader) {
        logger.warn(
          c.yellow(
            `Invalid paths file export in ${pathsFile}. ` +
              `Missing "paths" property from default export.`
          )
        )
        continue
      }

      // record deps for hmr
      newModuleGraph.add(
        loaderPath,
        mod.dependencies.map((p) => normalizePath(path.resolve(p)))
      )
    }

    const resolveRoute = async (): Promise<ResolvedRouteConfig[]> => {
      let pathsData: UserRouteConfig[]

      if (typeof loader === 'function') {
        const watchedFiles = await glob(watch, {
          absolute: true,
          ...options.globOptions
        })
        pathsData = await loader(watchedFiles)
      } else {
        pathsData = loader
      }

      const routes = pathsData.map((userConfig) => {
        const resolvedPath = route.replace(
          dynamicRouteRE,
          (_, key) => userConfig.params[key]
        )
        return {
          path: resolvedPath,
          fullPath: normalizePath(path.resolve(srcDir, resolvedPath)),
          route,
          loaderPath,
          ...userConfig
        }
      })

      const mod = { watch, routes, loader, transformPageData, options }
      routeModuleCache.set(loaderPath, mod)

      return routes
    }

    pendingResolveRoutes.push(resolveRoute())
  }

  const resolvedRoutes = (await Promise.all(pendingResolveRoutes)).flat()
  moduleGraph = newModuleGraph

  return resolvedRoutes
}

function getModules(
  id: string,
  envModuleGraph: EnvironmentModuleGraph,
  deleteFromRouteModuleCache = true
) {
  const modules: EnvironmentModuleNode[] = []
  for (const file of moduleGraph.delete(id)) {
    deleteFromRouteModuleCache && routeModuleCache.delete(file)
    modules.push(...(envModuleGraph.getModulesByFile(file)?.values() ?? []))
  }
  return modules
}
