import { createHash } from 'node:crypto'
import path from 'node:path'
import { normalizePath, type Plugin, type Rolldown } from 'vite'
import { APP_PATH, DEFAULT_THEME_PATH, DIST_CLIENT_PATH } from '../../alias'
import type { SiteConfig } from '../../config'

export type SsrRuntimeBridgeMap = Record<string, string>

const CSS_LANGS_RE =
  /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/
const declarationSourceRE = /\.d\.[cm]?ts$/
const dependencyPathRE = /(?:^|\/)node_modules(?:\/|$)/
const knownAssetSourceRE =
  /\.(?:apng|bmp|png|jpe?g|jfif|pjpeg|pjp|gif|svg|ico|webp|avif|cur|jxl|mp4|webm|ogg|mp3|wav|flac|aac|opus|mov|m4a|vtt|woff2?|eot|ttf|otf|webmanifest|pdf|txt)(?:$|[?#])/i
const nonRuntimeModuleQueryRE =
  /(?:\?|&)(?:raw|url|inline|worker|sharedworker|init|direct)(?:[=&]|$)|\?vue&type=(?:style|custom)(?:&|$)/

/** @internal Exported for focused pipeline tests. */
export function createSsrRuntimeInput(
  config: Pick<SiteConfig, 'themeDir'>,
  bridgeModuleIds: Set<string> = new Set()
) {
  const input: Record<string, string> = {
    app: path.resolve(APP_PATH, 'ssrRuntime.js'),
    // These bridge entries share chunks with the app entry. Artifact runners
    // can externalize imports without duplicating injection symbols or Vue
    // state.
    vitepress: path.resolve(DIST_CLIENT_PATH, 'index.js'),
    theme: path.resolve(DEFAULT_THEME_PATH, 'index.js')
  }

  bridgeModuleIds.add(normalizePath(input.vitepress))
  bridgeModuleIds.add(normalizePath(input.theme))

  if (normalizePath(config.themeDir) === normalizePath(DEFAULT_THEME_PATH)) {
    return input
  }

  // Let Vite resolve the theme entry and custom extensions. Emit other bridge
  // facades only for sources that Rolldown finds in the runtime graph.
  input['site-theme'] = '@theme/index'
  return input
}

function isSsrRuntimeGraphSource(
  id: string,
  moduleInfo?: Pick<Rolldown.ModuleInfo, 'meta'>
): boolean {
  const sourceId = id.replace(/[?#].*$/, '')
  if (
    moduleInfo?.meta?.['vite:asset'] ||
    id.includes('#') ||
    nonRuntimeModuleQueryRE.test(id) ||
    declarationSourceRE.test(sourceId) ||
    CSS_LANGS_RE.test(id) ||
    knownAssetSourceRE.test(id)
  ) {
    return false
  }

  if (id.startsWith('\0')) {
    // Virtual JavaScript modules have no useful extension. Previous checks
    // rejected styles and assets. Pages cannot import declarations or Vite
    // implementation modules as source identities.
    return (
      !id.startsWith('\0vite/') &&
      !id.startsWith('\0vite:') &&
      !id.startsWith('\0plugin-vue:')
    )
  }

  // Keep Vite's normal SSR externalization for bare and native modules. Exclude
  // package files even when a plugin bundles a dependency. A bridge for each
  // package module would change Node's package semantics.
  if (!path.isAbsolute(id) || dependencyPathRE.test(id)) return false

  // VitePress has strict entries for its client and default-theme roots. Treat
  // descendant implementation files as package code, not site singletons.
  if (
    id === normalizePath(DIST_CLIENT_PATH) ||
    id.startsWith(`${normalizePath(DIST_CLIENT_PATH)}/`)
  ) {
    return false
  }

  // A `moduleParsed` call proves that a loader produced JavaScript. Accept
  // custom and extensionless files because plugins can provide singleton
  // modules from them.
  return true
}

function isSsrRuntimeBridgeSource(
  id: string,
  moduleInfo: Pick<Rolldown.ModuleInfo, 'meta'>
): boolean {
  return (
    isSsrRuntimeGraphSource(id, moduleInfo) &&
    (id.startsWith('\0') || !id.includes('?'))
  )
}

/** @internal Exported for focused pipeline tests. */
export function createSsrRuntimeBridgePlugin(
  bridgeModuleIds: Set<string>
): Plugin {
  const emitted = new Set<string>()
  const reachableFromTheme = new Set<string>()
  const parsedModules = new Map<string, Rolldown.ModuleInfo>()
  let themeEntryId: string | undefined

  const emitBridge = (
    context: Rolldown.PluginContext,
    moduleInfo: Rolldown.ModuleInfo
  ) => {
    const id = normalizePath(moduleInfo.id)
    if (!isSsrRuntimeBridgeSource(id, moduleInfo)) return

    bridgeModuleIds.add(id)
    if (moduleInfo.isEntry || emitted.has(id)) return
    emitted.add(id)
    context.emitFile({
      type: 'chunk',
      id: moduleInfo.id,
      name: `site-runtime-${createHash('sha256').update(id).digest('hex').slice(0, 16)}`,
      // Create an importable facade for each source identity. Rolldown shares
      // the implementation chunk with app.js and does not evaluate it twice.
      preserveSignature: 'strict'
    })
  }

  const visitThemeGraph = (
    context: Rolldown.PluginContext,
    startingId: string
  ) => {
    const pending = [startingId]
    while (pending.length) {
      const rawId = pending.pop()!
      const id = normalizePath(rawId)
      if (reachableFromTheme.has(id)) continue
      reachableFromTheme.add(id)

      const moduleInfo = parsedModules.get(id)
      if (!moduleInfo) continue
      emitBridge(context, moduleInfo)
      if (id !== themeEntryId && !isSsrRuntimeGraphSource(id, moduleInfo)) {
        continue
      }
      pending.push(
        ...moduleInfo.importedIds,
        ...moduleInfo.dynamicallyImportedIds
      )
    }
  }

  return {
    name: 'vitepress:ssr-runtime-theme-bridges',
    resolveId(id) {
      // A virtual module owner can resolve only its public ID. Rolldown resolves
      // emitted entries from the canonical ID. Preserve it without a second
      // resolution.
      if (id.startsWith('\0') && emitted.has(normalizePath(id))) return id
    },
    async buildStart() {
      // Record the resolved theme entry and its file descendants. This supports
      // custom resolvers that map `@theme/index` to a virtual or external
      // source.
      const resolved = await this.resolve('@theme/index', undefined, {
        isEntry: true
      })
      if (!resolved || resolved.external) {
        this.error(
          'Unable to resolve the custom theme entry for the shared SSR runtime.'
        )
      }
      const id = normalizePath(resolved.id)
      themeEntryId = id
      bridgeModuleIds.add(id)
      visitThemeGraph(this, resolved.id)
    },
    moduleParsed(moduleInfo) {
      const id = normalizePath(moduleInfo.id)
      if (id !== themeEntryId && !isSsrRuntimeGraphSource(id, moduleInfo)) {
        return
      }
      parsedModules.set(id, moduleInfo)

      if (
        reachableFromTheme.has(id) ||
        moduleInfo.importers.some((importer) =>
          reachableFromTheme.has(normalizePath(importer))
        ) ||
        moduleInfo.dynamicImporters.some((importer) =>
          reachableFromTheme.has(normalizePath(importer))
        )
      ) {
        // Rolldown can parse a module before it finds the custom-theme importer.
        // Walk the known forward graph so traversal order cannot change the
        // result.
        reachableFromTheme.delete(id)
        visitThemeGraph(this, moduleInfo.id)
      }
    }
  }
}

/** @internal Exported for focused pipeline tests. */
export function collectSsrRuntimeBridges(
  result: Rolldown.RolldownOutput,
  outDir: string,
  bridgeModuleIds: ReadonlySet<string>
): SsrRuntimeBridgeMap {
  const bridges = Object.create(null) as SsrRuntimeBridgeMap
  for (const output of result.output) {
    if (output.type !== 'chunk' || !output.isEntry || !output.facadeModuleId) {
      continue
    }
    const moduleId = normalizePath(output.facadeModuleId)
    if (!bridgeModuleIds.has(moduleId)) continue
    bridges[moduleId] = path.resolve(outDir, output.fileName)
  }

  const missing = [...bridgeModuleIds]
    .filter((moduleId) => bridges[moduleId] === undefined)
    .sort()
  if (missing.length) {
    throw new Error(
      `The shared SSR runtime did not emit an entry facade for:\n${missing.map((id) => `  ${id}`).join('\n')}\nPage modules cannot safely reuse this runtime without those bridges.`
    )
  }
  return bridges
}
