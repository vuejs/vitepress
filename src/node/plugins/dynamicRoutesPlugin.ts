import fs from 'fs-extra'
import path from 'node:path'
import c from 'picocolors'
import { isMatch } from 'picomatch'
import { glob } from 'tinyglobby'
import {
  loadConfigFromFile,
  normalizePath,
  type EnvironmentModuleNode,
  type Logger,
  type Plugin
} from 'vite'
import type { Awaitable } from '../shared'
import { type SiteConfig, type UserConfig } from '../siteConfig'
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
}

interface ResolvedRouteModule {
  watch: string[] | undefined
  routes: ResolvedRouteConfig[] | undefined
  loader: RouteModule['paths']
  transformPageData?: RouteModule['transformPageData']
}

const dynamicRouteRE = /\[(\w+?)\]/g
const pathLoaderRE = /\.paths\.m?[jt]s$/

const routeModuleCache = new Map<string, ResolvedRouteModule>()
let moduleGraph = new ModuleGraph()

/**
 * Helper for defining routes with type inference
 */
export function defineRoutes(loader: RouteModule) {
  return loader
}

export async function resolvePages(
  srcDir: string,
  userConfig: UserConfig,
  logger: Logger,
  rebuildCache = false
): Promise<Pick<SiteConfig, 'pages' | 'dynamicRoutes' | 'rewrites'>> {
  if (rebuildCache) {
    moduleGraph = new ModuleGraph()
    routeModuleCache.clear()
  }

  // Important: tinyglobby doesn't guarantee order of the returned files.
  // We must sort the pages so the input list to rollup is stable across
  // builds - otherwise different input order could result in different exports
  // order in shared chunks which in turns invalidates the hash of every chunk!
  // JavaScript built-in sort() is mandated to be stable as of ES2019 and
  // supported in Node 12+, which is required by Vite.
  const allMarkdownFiles = (
    await glob(['**/*.md'], {
      cwd: srcDir,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        ...(userConfig.srcExclude || [])
      ],
      expandDirectories: false
    })
  ).sort()

  const pages: string[] = []
  const dynamicRouteFiles: string[] = []

  allMarkdownFiles.forEach((file) => {
    dynamicRouteRE.lastIndex = 0
    ;(dynamicRouteRE.test(file) ? dynamicRouteFiles : pages).push(file)
  })

  const dynamicRoutes = await resolveDynamicRoutes(
    srcDir,
    dynamicRouteFiles,
    logger
  )

  pages.push(...dynamicRoutes.map((r) => r.path))

  const rewrites = resolveRewrites(pages, userConfig.rewrites)

  return {
    pages,
    dynamicRoutes,
    rewrites,
    // @ts-expect-error internal flag to reload resolution cache in ../markdownToVue.ts
    __dirty: true
  }
}

export const dynamicRoutesPlugin = async (
  config: SiteConfig
): Promise<Plugin> => {
  return {
    name: 'vitepress:dynamic-routes',

    resolveId(id) {
      if (!id.endsWith('.md')) return
      const normalizedId = id.startsWith(config.srcDir)
        ? id
        : normalizePath(path.resolve(config.srcDir, id.replace(/^\//, '')))
      const matched = config.dynamicRoutes.find(
        (r) => r.fullPath === normalizedId
      )
      if (matched) {
        return normalizedId
      }
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
      for (const id of moduleGraph.delete(normalizedFile)) {
        routeModuleCache.delete(id)
        const mod = this.environment.moduleGraph.getModuleById(id)
        if (mod) {
          modules.push(mod)
        }
      }

      // Also check if the file matches any custom watch patterns.
      let watchedFileChanged = false
      for (const [file, route] of routeModuleCache) {
        if (route.watch && isMatch(normalizedFile, route.watch)) {
          route.routes = undefined
          watchedFileChanged = true

          for (const id of moduleGraph.delete(file)) {
            const mod = this.environment.moduleGraph.getModuleById(id)
            if (mod) {
              modules.push(mod)
            }
          }
        }
      }

      if (
        (modules.length && !normalizedFile.endsWith('.md')) ||
        watchedFileChanged ||
        pathLoaderRE.test(normalizedFile)
      ) {
        // path loader module or deps updated, reset loaded routes
        Object.assign(
          config,
          await resolvePages(config.srcDir, config.userConfig, config.logger)
        )
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
    let extras: Partial<ResolvedRouteModule>

    const loaderPath = normalizePath(pathsFile)
    const existing = routeModuleCache.get(loaderPath)

    if (existing) {
      // use cached routes if not invalidated by hmr
      if (existing.routes) {
        pendingResolveRoutes.push(Promise.resolve(existing.routes))
        continue
      }

      ;({ watch, loader, ...extras } = existing)
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

      // @ts-ignore
      ;({ paths: loader, watch, ...extras } = mod.config)

      if (!loader) {
        logger.warn(
          c.yellow(
            `Invalid paths file export in ${pathsFile}. ` +
              `Missing "paths" property from default export.`
          )
        )
        continue
      }

      watch = typeof watch === 'string' ? [watch] : watch
      if (watch) {
        watch = watch.map((p) =>
          p.startsWith('.')
            ? normalizePath(path.resolve(path.dirname(pathsFile), p))
            : normalizePath(p)
        )
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
        let watchedFiles: string[] = []
        if (watch) {
          watchedFiles = (
            await glob(watch, {
              ignore: ['**/node_modules/**', '**/dist/**'],
              expandDirectories: false
            })
          ).sort()
        }
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

      routeModuleCache.set(loaderPath, { ...extras, watch, routes, loader })

      return routes
    }

    pendingResolveRoutes.push(resolveRoute())
  }

  const resolvedRoutes = (await Promise.all(pendingResolveRoutes)).flat()
  moduleGraph = newModuleGraph

  return resolvedRoutes
}
