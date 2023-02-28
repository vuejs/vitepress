import {
  loadConfigFromFile,
  normalizePath,
  type Plugin,
  type ViteDevServer
} from 'vite'
import fs from 'fs-extra'
import c from 'picocolors'
import path from 'path'
import { resolvePages, type SiteConfig } from '../config'

export const dynamicRouteRE = /\[(\w+?)\]/g

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

export type ResolvedRouteConfig = UserRouteConfig & {
  /**
   * the raw route, e.g. foo/[bar].md
   */
  route: string
  /**
   * the actual path with params resolved, e.g. foo/1.md
   */
  path: string
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
      const normalizedId = id.startsWith(config.root)
        ? normalizePath(path.relative(config.root, id))
        : id.replace(/^\//, '')
      const matched = config.dynamicRoutes.routes.find(
        (r) => r.path === normalizedId
      )
      if (matched) {
        return normalizedId
      }
    },

    load(id) {
      const matched = config.dynamicRoutes.routes.find((r) => r.path === id)
      if (matched) {
        const { route, params, content } = matched
        const routeFile = normalizePath(path.resolve(config.root, route))
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
  routes: string[]
): Promise<SiteConfig['dynamicRoutes']> {
  const pendingResolveRoutes: Promise<ResolvedRouteConfig[]>[] = []
  const routeFileToModulesMap: Record<string, Set<string>> = {}

  for (const route of routes) {
    // locate corresponding route paths file
    const jsPathsFile = route.replace(/\.md$/, '.paths.js')
    let pathsFile = jsPathsFile
    if (!fs.existsSync(jsPathsFile)) {
      pathsFile = route.replace(/\.md$/, '.paths.ts')
      if (!fs.existsSync(pathsFile)) {
        console.warn(
          c.yellow(
            `missing paths file for dynamic route ${route}: ` +
              `a corresponding ${jsPathsFile} or ${pathsFile} is needed.`
          )
        )
        continue
      }
    }

    // load the paths loader module
    let mod: RouteModule
    try {
      mod = (await loadConfigFromFile(
        {} as any,
        path.resolve(pathsFile)
      )) as RouteModule
    } catch (e) {
      console.warn(`invalid paths file export in ${pathsFile}.`)
      continue
    }

    if (mod) {
      // this array represents the virtual modules affected by this route
      const matchedModuleIds = (routeFileToModulesMap[
        normalizePath(path.resolve(route))
      ] = new Set())

      // each dependency (including the loader module itself) also point to the
      // same array
      for (const dep of mod.dependencies) {
        routeFileToModulesMap[normalizePath(path.resolve(dep))] =
          matchedModuleIds
      }

      const resolveRoute = async (): Promise<ResolvedRouteConfig[]> => {
        const loader = mod.config.paths
        const paths = await (typeof loader === 'function' ? loader() : loader)
        return paths.map((userConfig) => {
          return {
            path: route.replace(
              dynamicRouteRE,
              (_, key) => userConfig.params[key]
            ),
            route,
            ...userConfig
          }
        })
      }
      pendingResolveRoutes.push(resolveRoute())
    }
  }

  return {
    routes: (await Promise.all(pendingResolveRoutes)).flat(),
    fileToModulesMap: routeFileToModulesMap
  }
}
