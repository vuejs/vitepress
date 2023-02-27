import { loadConfigFromFile, type Plugin } from 'vite'
import fs from 'fs-extra'
import c from 'picocolors'
import path from 'path'

export const dynamicRouteRE = /\[(\.\.\.)?\w+\]/

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

type ResolvedRouteConfig = UserRouteConfig & {
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
  routes: string[]
): Promise<Plugin> => {
  const pendingResolveRoutes: Promise<ResolvedRouteConfig[]>[] = []

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
      const resolveRoute = async (): Promise<ResolvedRouteConfig[]> => {
        const loader = mod.config.paths
        const paths = await (typeof loader === 'function' ? loader() : loader)
        return paths.map((userConfig) => {
          return {
            route,
            path:
              '/' +
              route.replace(/\[(\w+)\]/g, (_, key) => userConfig.params[key]),
            ...userConfig
          }
        })
      }
      pendingResolveRoutes.push(resolveRoute())
    }
  }

  const resolvedRoutes = (await Promise.all(pendingResolveRoutes)).flat()

  return {
    name: 'vitepress:dynamic-routes',
    load(id) {
      const matched = resolvedRoutes.find((r) => r.path === id)
      if (matched) {
        const { route, params, content } = matched
        let baseContent = fs.readFileSync(route, 'utf-8')

        // inject raw content at build time
        if (content) {
          baseContent = baseContent.replace(/<!--\s*@content\s*-->/, content)
        }

        // params are injected with special markers and extracted as part of
        // __pageData in ../markdownTovue.ts
        return `__VP_PARAMS_START${JSON.stringify(
          params
        )}__VP_PARAMS_END__${baseContent}`
      }
    }
    // TODO HMR
  }
}
