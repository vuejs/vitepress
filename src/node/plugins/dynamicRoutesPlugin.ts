import {
  loadConfigFromFile,
  normalizePath,
  type Plugin,
  type ViteDevServer
} from 'vite'
import fs from 'fs-extra'
import c from 'picocolors'
import path from 'path'
import fg from 'fast-glob'
import { type SiteConfig, type UserConfig } from '../siteConfig'
import { resolveRewrites } from './rewritesPlugin'

export const dynamicRouteRE = /\[(\w+?)\]/g

export async function resolvePages(srcDir: string, userConfig: UserConfig) {
  // Important: fast-glob doesn't guarantee order of the returned files.
  // We must sort the pages so the input list to rollup is stable across
  // builds - otherwise different input order could result in different exports
  // order in shared chunks which in turns invalidates the hash of every chunk!
  // JavaScript built-in sort() is mandated to be stable as of ES2019 and
  // supported in Node 12+, which is required by Vite.
  const allMarkdownFiles = (
    await fg(['**.md'], {
      cwd: srcDir,
      ignore: ['**/node_modules', ...(userConfig.srcExclude || [])]
    })
  ).sort()

  const pages: string[] = []
  const dynamicRouteFiles: string[] = []

  allMarkdownFiles.forEach((file) => {
    dynamicRouteRE.lastIndex = 0
    ;(dynamicRouteRE.test(file) ? dynamicRouteFiles : pages).push(file)
  })

  const dynamicRoutes = await resolveDynamicRoutes(srcDir, dynamicRouteFiles)
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
    paths:
      | UserRouteConfig[]
      | (() => UserRouteConfig[] | Promise<UserRouteConfig[]>)
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
  let server: ViteDevServer

  return {
    name: 'vitepress:dynamic-routes',

    configureServer(_server) {
      server = _server
    },

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
        // we use a speical injection syntax so the content is rendered as
        // static local content instead of included as runtime data.
        if (content) {
          baseContent = baseContent.replace(/<!--\s*@content\s*-->/, content)
        }

        // params are injected with special markers and extracted as part of
        // __pageData in ../markdownTovue.ts
        return `__VP_PARAMS_START${JSON.stringify(
          params
        )}__VP_PARAMS_END__${baseContent}`
      }
    },

    async handleHotUpdate(ctx) {
      routeModuleCache.delete(ctx.file)
      const mods = config.dynamicRoutes.fileToModulesMap[ctx.file]
      if (mods) {
        // path loader module or deps updated, reset loaded routes
        if (!/\.md$/.test(ctx.file)) {
          Object.assign(
            config,
            await resolvePages(config.srcDir, config.userConfig)
          )
        }
        for (const id of mods) {
          ctx.modules.push(server.moduleGraph.getModuleById(id)!)
        }
      }
    }
  }
}

export async function resolveDynamicRoutes(
  srcDir: string,
  routes: string[]
): Promise<SiteConfig['dynamicRoutes']> {
  const pendingResolveRoutes: Promise<ResolvedRouteConfig[]>[] = []
  const routeFileToModulesMap: Record<string, Set<string>> = {}

  for (const route of routes) {
    // locate corresponding route paths file
    const fullPath = normalizePath(path.resolve(srcDir, route))
    const jsPathsFile = fullPath.replace(/\.md$/, '.paths.js')
    let pathsFile = jsPathsFile
    if (!fs.existsSync(jsPathsFile)) {
      pathsFile = fullPath.replace(/\.md$/, '.paths.ts')
      if (!fs.existsSync(pathsFile)) {
        console.warn(
          c.yellow(
            `Missing paths file for dynamic route ${route}: ` +
              `a corresponding ${jsPathsFile} or ${pathsFile} is needed.`
          )
        )
        continue
      }
    }

    // load the paths loader module
    let mod = routeModuleCache.get(pathsFile)
    if (!mod) {
      try {
        mod = (await loadConfigFromFile({} as any, pathsFile)) as RouteModule
        routeModuleCache.set(pathsFile, mod)
      } catch (e) {
        console.warn(
          c.yellow(
            `Invalid paths file export in ${pathsFile}. ` +
              `Expects default export of an object with a "paths" property.`
          )
        )
        continue
      }
    }

    // this array represents the virtual modules affected by this route
    const matchedModuleIds = (routeFileToModulesMap[
      normalizePath(path.resolve(srcDir, route))
    ] = new Set())

    // each dependency (including the loader module itself) also point to the
    // same array
    for (const dep of mod.dependencies) {
      // deps are resolved relative to cwd
      routeFileToModulesMap[normalizePath(path.resolve(dep))] = matchedModuleIds
    }

    const loader = mod!.config.paths
    if (!loader) {
      console.warn(
        c.yellow(
          `Invalid paths file export in ${pathsFile}. ` +
            `Missing "paths" property from default export.`
        )
      )
      continue
    }

    const resolveRoute = async (): Promise<ResolvedRouteConfig[]> => {
      const paths = await (typeof loader === 'function' ? loader() : loader)
      return paths.map((userConfig) => {
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
