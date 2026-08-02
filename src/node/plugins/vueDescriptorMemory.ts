import { normalizePath, type Plugin, type ResolvedConfig } from 'vite'

export const VUE_DESCRIPTOR_MEMORY_PLUGIN = 'vitepress:vue-descriptor-memory'

interface MutableSfcBlock {
  content?: string
  map?: unknown
  ast?: unknown
  loc?: { source?: string }
}

interface MutableSfcDescriptor {
  filename?: string
  source?: string
  template?: MutableSfcBlock | null
  script?: MutableSfcBlock | null
  scriptSetup?: MutableSfcBlock | null
  styles?: MutableSfcBlock[]
  customBlocks?: MutableSfcBlock[]
}

interface MutableCompileScriptResult {
  content?: string
  map?: unknown
  scriptAst?: unknown
  scriptSetupAst?: unknown
  deps?: string[]
  imports?: Record<string, unknown>
  bindings?: Record<string, unknown>
}

interface MutableVueCompiler {
  parse: (...args: any[]) => { descriptor?: MutableSfcDescriptor }
  compileScript?: (
    descriptor: MutableSfcDescriptor,
    ...args: any[]
  ) => MutableCompileScriptResult
  parseCache?: { clear?: () => void }
}

interface MutableVuePluginOptions {
  compiler?: MutableVueCompiler
  [key: string]: unknown
}

interface MutableVuePluginApi {
  options: MutableVuePluginOptions
}

interface VuePluginWithCompiler extends Plugin {
  api?: MutableVuePluginApi
}

export interface VueDescriptorMemoryApi {
  release(files?: Iterable<string>): void
  readonly retainedFiles: number
}

const descriptorLeases = new WeakMap<MutableSfcDescriptor, number>()
const scriptLeases = new WeakMap<MutableCompileScriptResult, number>()

function retainTracked<T extends object>(
  values: Set<T>,
  value: T,
  leases: WeakMap<T, number>
): void {
  if (values.has(value)) return
  values.add(value)
  leases.set(value, (leases.get(value) ?? 0) + 1)
}

function releaseTracked<T extends object>(
  values: Set<T> | undefined,
  leases: WeakMap<T, number>,
  compact: (value: T) => void
): void {
  if (!values) return
  for (const value of values) {
    const count = leases.get(value) ?? 1
    if (count <= 1) {
      leases.delete(value)
      compact(value)
    } else {
      leases.set(value, count - 1)
    }
  }
}

function compactBlock(block: MutableSfcBlock | null | undefined): void {
  if (!block) return
  block.content = ''
  block.map = undefined
  block.ast = undefined
  if (block.loc) block.loc.source = ''
}

function compactDescriptor(descriptor: MutableSfcDescriptor): void {
  descriptor.source = ''
  compactBlock(descriptor.template)
  compactBlock(descriptor.script)
  compactBlock(descriptor.scriptSetup)
  descriptor.styles?.forEach(compactBlock)
  descriptor.customBlocks?.forEach(compactBlock)
}

function compactScript(result: MutableCompileScriptResult): void {
  result.content = ''
  result.map = undefined
  result.scriptAst = undefined
  result.scriptSetupAst = undefined
  result.deps = []
  result.imports = {}
  result.bindings = {}
}

/**
 * @vitejs/plugin-vue stores SFC descriptors in global maps. This can retain
 * page source, block locations, and template ASTs after compilation. Track the
 * same descriptors through the public compiler option. Compact them after the
 * build or batch finishes.
 */
export function createVueDescriptorMemoryPlugin(
  vuePlugin: Plugin
): Plugin & { api: VueDescriptorMemoryApi } {
  const descriptors = new Map<string, Set<MutableSfcDescriptor>>()
  const scripts = new Map<string, Set<MutableCompileScriptResult>>()
  let vueApi: MutableVuePluginApi | undefined
  let sourceCompiler: MutableVueCompiler | undefined
  let compilerFacade: MutableVueCompiler | undefined
  let originalParse: MutableVueCompiler['parse'] | undefined
  let originalCompileScript: MutableVueCompiler['compileScript'] | undefined

  const release: VueDescriptorMemoryApi['release'] = (files) => {
    const selected = files
      ? new Set([...files].map((file) => normalizePath(file)))
      : new Set([...descriptors.keys(), ...scripts.keys()])

    for (const file of selected) {
      releaseTracked(descriptors.get(file), descriptorLeases, compactDescriptor)
      releaseTracked(scripts.get(file), scriptLeases, compactScript)
      descriptors.delete(file)
      scripts.delete(file)
    }
    sourceCompiler?.parseCache?.clear?.()
  }

  const dispose = () => {
    release()
    if (
      vueApi &&
      sourceCompiler &&
      compilerFacade &&
      vueApi.options.compiler === compilerFacade
    ) {
      vueApi.options = {
        ...vueApi.options,
        compiler: sourceCompiler
      }
    }
    vueApi = undefined
    sourceCompiler = undefined
    compilerFacade = undefined
    originalParse = undefined
    originalCompileScript = undefined
  }

  const api: VueDescriptorMemoryApi = {
    release,
    get retainedFiles() {
      return new Set([...descriptors.keys(), ...scripts.keys()]).size
    }
  }

  const memoryPlugin: Plugin & { api: VueDescriptorMemoryApi } = {
    name: VUE_DESCRIPTOR_MEMORY_PLUGIN,
    api,
    buildStart: {
      order: 'post',
      sequential: true,
      handler() {
        const api = (vuePlugin as VuePluginWithCompiler).api
        const resolvedCompiler = api?.options.compiler
        if (!api || !resolvedCompiler || resolvedCompiler === compilerFacade) {
          return
        }

        dispose()
        vueApi = api
        sourceCompiler = resolvedCompiler
        originalParse = resolvedCompiler.parse

        // plugin-vue uses a global @vue/compiler-sfc module. Do not patch this
        // shared module because builds can use it at the same time. Give this
        // plugin instance a separate facade through the public API.
        const facade = Object.create(resolvedCompiler) as MutableVueCompiler
        facade.parse = function (...args) {
          const result = originalParse!.apply(sourceCompiler, args)
          const descriptor = result?.descriptor
          if (descriptor?.filename) {
            const filename = normalizePath(descriptor.filename)
            let retained = descriptors.get(filename)
            if (!retained) descriptors.set(filename, (retained = new Set()))
            retainTracked(retained, descriptor, descriptorLeases)
          }
          return result
        }

        if (resolvedCompiler.compileScript) {
          originalCompileScript = resolvedCompiler.compileScript
          facade.compileScript = function (descriptor, ...args) {
            const result = originalCompileScript!.call(
              sourceCompiler,
              descriptor,
              ...args
            )
            if (descriptor.filename) {
              const filename = normalizePath(descriptor.filename)
              let retained = scripts.get(filename)
              if (!retained) scripts.set(filename, (retained = new Set()))
              retainTracked(retained, result, scriptLeases)
            }
            return result
          }
        }

        compilerFacade = facade
        api.options = {
          ...api.options,
          compiler: facade
        }
      }
    },
    buildEnd: {
      order: 'post',
      sequential: true,
      handler(error) {
        release()
        // Rollup can omit `closeBundle` after a graph error. Restore this plugin
        // facade here when the build fails.
        if (error) dispose()
      }
    },
    closeBundle: {
      order: 'post',
      sequential: true,
      handler() {
        dispose()
      }
    }
  }

  return memoryPlugin
}

export function getVueDescriptorMemoryApi(
  config: ResolvedConfig
): VueDescriptorMemoryApi | undefined {
  return (
    config.plugins.find(
      (plugin) => plugin.name === VUE_DESCRIPTOR_MEMORY_PLUGIN
    ) as (Plugin & { api?: VueDescriptorMemoryApi }) | undefined
  )?.api
}
