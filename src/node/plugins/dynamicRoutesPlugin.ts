import fs from 'fs-extra'
import path from 'node:path'
import c from 'picocolors'
import { glob } from 'tinyglobby'
import {
  loadConfigFromFile,
  normalizePath,
  type EnvironmentModuleNode,
  type Logger,
  type Plugin
} from 'vite'
import { type SiteConfig, type UserConfig } from '../siteConfig'
import { resolveRewrites } from './rewritesPlugin'

export const dynamicRouteRE = /\[(\w+?)\]/g

export async function resolvePages(
  srcDir: string,
  userConfig: UserConfig,
  logger: Logger
) {
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
  pages.push(...dynamicRoutes.routes.map((r) => r.path))

  const rewrites = resolveRewrites(pages, userConfig.rewrites)

  return {
    pages,
    dynamicRoutes,
    rewrites
  }
}

interface UserRouteConfig {
  params: Record<string, string>
  content?: string
}

interface RouteModule {
  path: string
  config: {
    watch?: string[] | string
    paths:
      | UserRouteConfig[]
      | ((
          watchedFiles: string[]
        ) => UserRouteConfig[] | Promise<UserRouteConfig[]>)
  }
  dependencies: string[]
}

const routeModuleCache = new Map<string, RouteModule>()

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
      const matched = config.dynamicRoutes.routes.find(
        (r) => r.fullPath === normalizedId
      )
      if (matched) {
        return normalizedId
      }
    },

    load(id) {
      const matched = config.dynamicRoutes.routes.find((r) => r.fullPath === id)
      if (matched) {
        const { route, params, content } = matched
        const routeFile = normalizePath(path.resolve(config.srcDir, route))
        config.dynamicRoutes.fileToModulesMap[routeFile].add(id)

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

      const normalizedFile = normalizePath(file)
      // Invalidate any cached route modules whose key or dependencies include the changed file.
      for (const [cacheKey, mod] of routeModuleCache.entries()) {
        const normalizedCacheKey = normalizePath(cacheKey)
        if (
          normalizedCacheKey === normalizedFile ||
          mod.dependencies.some(
            (dep) => normalizePath(path.resolve(dep)) === normalizedFile
          )
        ) {
          routeModuleCache.delete(cacheKey)
        }
      }

      const modules: EnvironmentModuleNode[] = []

      const mods = config.dynamicRoutes.fileToModulesMap[normalizedFile]
      if (mods) {
        // path loader module or deps updated, reset loaded routes
        if (!normalizedFile.endsWith('.md')) {
          Object.assign(
            config,
            await resolvePages(config.srcDir, config.userConfig, config.logger)
          )
        }
        for (const id of mods) {
          const mod = this.environment.moduleGraph.getModuleById(id)
          if (mod) {
            modules.push(mod)
          }
        }
      }

      return modules.length > 0 ? [...existingMods, ...modules] : undefined
    }
  }
}

export async function resolveDynamicRoutes(
  srcDir: string,
  routes: string[],
  logger: Logger
): Promise<SiteConfig['dynamicRoutes']> {
  const pendingResolveRoutes: Promise<ResolvedRouteConfig[]>[] = []
  const routeFileToModulesMap: Record<string, Set<string>> = {}

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
    let mod = routeModuleCache.get(pathsFile)
    if (!mod) {
      try {
        mod = (await loadConfigFromFile(
          {} as any,
          pathsFile,
          undefined,
          'silent'
        )) as RouteModule
        routeModuleCache.set(pathsFile, mod)
      } catch (err: any) {
        logger.warn(
          `${c.yellow(`Failed to load ${pathsFile}:`)}\n${err.message}\n${err.stack}`
        )
        continue
      }
    }

    const loader = mod.config.paths
    if (!loader) {
      logger.warn(
        c.yellow(
          `Invalid paths file export in ${pathsFile}. ` +
            `Missing "paths" property from default export.`
        )
      )
      continue
    }

    // Create or retrieve the set of virtual module IDs affected by this route.
    const routeKey = normalizePath(path.resolve(srcDir, route))
    const matchedModuleIds =
      routeFileToModulesMap[routeKey] || new Set<string>()
    routeFileToModulesMap[routeKey] = matchedModuleIds

    // Track loader dependencies (merging sets if shared)
    for (const dep of mod.dependencies) {
      const depPath = normalizePath(path.resolve(dep))
      if (!routeFileToModulesMap[depPath]) {
        routeFileToModulesMap[depPath] = matchedModuleIds
      } else {
        for (const id of matchedModuleIds) {
          routeFileToModulesMap[depPath].add(id)
        }
      }
    }

    // Process custom watch files if provided.
    let watch: string[] | undefined
    if (mod.config.watch) {
      watch =
        typeof mod.config.watch === 'string'
          ? [mod.config.watch]
          : mod.config.watch
      watch = watch.map((p) =>
        p.startsWith('.')
          ? normalizePath(path.resolve(path.dirname(pathsFile), p))
          : normalizePath(p)
      )
      for (const watchFile of watch) {
        if (!routeFileToModulesMap[watchFile]) {
          routeFileToModulesMap[watchFile] = matchedModuleIds
        } else {
          for (const id of matchedModuleIds) {
            routeFileToModulesMap[watchFile].add(id)
          }
        }
      }
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
      return pathsData.map((userConfig) => {
        const resolvedPath = route.replace(
          dynamicRouteRE,
          (_, key) => userConfig.params[key]
        )
        return {
          path: resolvedPath,
          fullPath: normalizePath(path.resolve(srcDir, resolvedPath)),
          route,
          ...userConfig
        }
      })
    }
    pendingResolveRoutes.push(resolveRoute())
  }

  return {
    routes: (await Promise.all(pendingResolveRoutes)).flat(),
    fileToModulesMap: routeFileToModulesMap
  }
}
