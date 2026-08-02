import type { Plugin, Rolldown } from 'vite'

export interface SsrBatchPlan {
  offset: number
  pages: string[]
}

const SSR_PAGE_UNBUNDLED_HOOKS = [
  'moduleParsed',
  'resolveDynamicImport',
  'augmentChunkHash',
  'outputOptions',
  'renderChunk',
  'renderStart',
  'renderError',
  'writeBundle',
  'generateBundle',
  'banner',
  'footer',
  'intro',
  'outro'
] as const
const SSR_PAGE_OUTPUT_ADDONS = ['banner', 'footer', 'intro', 'outro'] as const
const SSR_PAGE_CONTEXT_HOOKS = [
  'options',
  'buildStart',
  'resolveId',
  'load',
  'transform',
  'buildEnd',
  'closeBundle'
] as const
const SSR_PAGE_UNAVAILABLE_CONTEXT_METHODS = new Set<PropertyKey>([
  'emitFile',
  'getFileName',
  'getModuleIds'
])
const buildModeEnvironmentFacades = new WeakMap<object, object>()

type SsrPageUnbundledHook = (typeof SSR_PAGE_UNBUNDLED_HOOKS)[number]
type PageUnbundledPlugin = {
  name?: string
} & Partial<Record<SsrPageUnbundledHook, unknown>>

interface PageUnbundledHookViolation {
  hooks: SsrPageUnbundledHook[]
  name: string
  source: 'plugin' | 'output plugin' | 'output options'
}

function isViteInternalPlugin(name: string): boolean {
  return (
    name === 'alias' ||
    name === 'vitepress' ||
    name.startsWith('vite:') ||
    name.startsWith('vitepress:') ||
    name.startsWith('builtin:') ||
    name.startsWith('native:')
  )
}

function unbundledHooks(plugin: PageUnbundledPlugin): SsrPageUnbundledHook[] {
  return SSR_PAGE_UNBUNDLED_HOOKS.filter((hook) => plugin[hook] != null)
}

function unsupportedPageContextMethod(
  pluginName: string,
  method: PropertyKey
): never {
  throw new Error(
    `Vite plugin ${JSON.stringify(pluginName)} called this.${String(method)}() while compiling unbundled SSR page modules. ` +
      'SSR batching has no Rolldown output or complete bundle graph for this context method. Exclude the plugin from the unbundled SSR environment or disable ssrBuildBatchSize.'
  )
}

function createBuildModeEnvironment(environment: object): object {
  const existing = buildModeEnvironmentFacades.get(environment)
  if (existing) return existing

  const facade = new Proxy(environment, {
    get(target, property) {
      if (property === 'mode') return 'build'
      const value = Reflect.get(target, property, target)
      return typeof value === 'function' ? value.bind(target) : value
    },
    set(target, property, value) {
      if (property === 'mode') return value === 'build'
      return Reflect.set(target, property, value, target)
    }
  })
  buildModeEnvironmentFacades.set(environment, facade)
  return facade
}

function createBuildModePluginContext(
  context: unknown,
  pluginName: string
): unknown {
  if (!context || typeof context !== 'object') return context

  const target = context as Record<PropertyKey, unknown>
  const environment = target.environment
  const buildEnvironment =
    environment && typeof environment === 'object'
      ? createBuildModeEnvironment(environment)
      : environment
  const meta = target.meta
  const buildMeta =
    meta && typeof meta === 'object'
      ? { ...(meta as object), watchMode: false }
      : meta

  return new Proxy(target, {
    get(target, property) {
      if (property === 'environment') return buildEnvironment
      if (property === 'meta') return buildMeta
      // Rolldown's production context does not expose these serve-only APIs.
      // Hide Vite's runnable-environment additions so feature detection is
      // identical to a production plugin context.
      if (property === 'setAssetSource' || property === 'getWatchFiles') {
        return undefined
      }
      if (
        SSR_PAGE_UNAVAILABLE_CONTEXT_METHODS.has(property) &&
        property in target
      ) {
        return () => unsupportedPageContextMethod(pluginName, property)
      }
      if (
        property === 'getCombinedSourcemap' &&
        typeof target._getCombinedSourcemap === 'function'
      ) {
        return target._getCombinedSourcemap.bind(target)
      }

      const value = Reflect.get(target, property, target)
      return typeof value === 'function' ? value.bind(target) : value
    }
  })
}

function adaptPluginHookContext(hook: unknown, pluginName: string): unknown {
  const handler =
    typeof hook === 'function'
      ? hook
      : hook && typeof hook === 'object'
        ? (hook as { handler?: unknown }).handler
        : undefined
  if (typeof handler !== 'function') return hook

  const wrapped = function (this: unknown, ...args: unknown[]) {
    return Reflect.apply(
      handler,
      createBuildModePluginContext(this, pluginName),
      args
    )
  }
  return typeof hook === 'function'
    ? wrapped
    : { ...(hook as object), handler: wrapped }
}

/**
 * A RunnableDevEnvironment supplies the transform/module graph needed by the
 * offline compiler, but its raw user contexts identify as dev/watch mode and
 * silently ignore Rolldown-only methods. Present production semantics to user
 * hooks and fail unsupported output/whole-graph access explicitly. Vite's own
 * plugins retain their native runnable-environment contexts.
 *
 * @internal Exported for focused pipeline tests.
 */
export function adaptSsrBatchPagePlugins(plugins: readonly Plugin[]): Plugin[] {
  return plugins.map((plugin) => {
    if (isViteInternalPlugin(plugin.name)) return plugin

    // A Proxy cannot legally return a wrapped hook for a frozen plugin's
    // non-configurable property. Copy resolved values onto a loose facade so
    // frozen and class-based plugin objects remain supported.
    const adapted = Object.create(Object.getPrototypeOf(plugin)) as Plugin &
      Record<PropertyKey, unknown>
    for (const property of Reflect.ownKeys(plugin)) {
      const descriptor = Object.getOwnPropertyDescriptor(plugin, property)!
      Object.defineProperty(adapted, property, {
        configurable: true,
        enumerable: descriptor.enumerable,
        value: Reflect.get(plugin, property, plugin),
        writable: true
      })
    }
    for (const hook of SSR_PAGE_CONTEXT_HOOKS) {
      const value = Reflect.get(plugin, hook, plugin)
      if (value == null) continue
      Object.defineProperty(adapted, hook, {
        configurable: true,
        enumerable: true,
        value: adaptPluginHookContext(value, plugin.name || '<anonymous>'),
        writable: true
      })
    }
    return adapted
  })
}

async function collectOutputPlugins(
  option: Rolldown.OutputOptions['plugins'],
  collected: PageUnbundledPlugin[]
): Promise<void> {
  const resolved = await option
  if (Array.isArray(resolved)) {
    for (const nested of resolved) {
      await collectOutputPlugins(nested, collected)
    }
  } else if (resolved && typeof resolved === 'object') {
    collected.push(resolved as PageUnbundledPlugin)
  }
}

/**
 * Batched page modules are transformed in an unbundled Vite environment, so
 * Rolldown's bundle-graph and output-generation phases never run for them.
 * Reject user hooks that would otherwise observe or mutate the legacy SSR
 * page bundle. `buildEnd` is deliberately supported: the unbundled plugin
 * container runs it during compiler teardown.
 *
 * @internal Exported for focused pipeline tests.
 */
export async function validateSsrBatchPageOutputHooks(
  plugins: readonly Plugin[],
  output: Rolldown.OutputOptions | Rolldown.OutputOptions[] | undefined
): Promise<void> {
  const violations: PageUnbundledHookViolation[] = []

  for (const plugin of plugins) {
    if (isViteInternalPlugin(plugin.name)) continue
    const hooks = unbundledHooks(plugin)
    if (hooks.length) {
      violations.push({ hooks, name: plugin.name, source: 'plugin' })
    }
  }

  const outputs = output ? (Array.isArray(output) ? output : [output]) : []
  for (const [index, options] of outputs.entries()) {
    const optionHooks = SSR_PAGE_OUTPUT_ADDONS.filter(
      (hook) => options[hook] != null
    )
    if (optionHooks.length) {
      violations.push({
        hooks: optionHooks,
        name: outputs.length === 1 ? 'output' : `output[${index}]`,
        source: 'output options'
      })
    }

    const outputPlugins: PageUnbundledPlugin[] = []
    await collectOutputPlugins(options.plugins, outputPlugins)
    for (const plugin of outputPlugins) {
      const hooks = unbundledHooks(plugin)
      if (hooks.length) {
        violations.push({
          hooks,
          name: plugin.name || '<anonymous>',
          source: 'output plugin'
        })
      }
    }
  }

  if (!violations.length) return

  const details = violations
    .map(
      ({ hooks, name, source }) =>
        `  - ${source} ${JSON.stringify(name)}: ${hooks.join(', ')}`
    )
    .join('\n')
  throw new Error(
    `SSR batching cannot preserve Rolldown bundle hooks for unbundled SSR page modules:\n${details}\nDisable ssrBuildBatchSize. If these hooks are bundled-only, register the plugin in vite.plugins and exclude it from the unbundled SSR environment with applyToEnvironment.`
  )
}

export function validateBuildConcurrency(value: unknown): number {
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new Error('buildConcurrency must be a positive integer.')
  }
  return value as number
}

export function validateSsrBuildBatchSize(value: unknown): number | undefined {
  if (value === undefined) return
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new Error('ssrBuildBatchSize must be a positive integer.')
  }
  return value as number
}

export function validateSsrBuildWorkerConcurrency(value: unknown): number {
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new Error('ssrBuildWorkerConcurrency must be a positive integer.')
  }
  return value as number
}

export function createSsrBatchPlan(
  sitePages: string[],
  batchSize: number
): SsrBatchPlan[] {
  batchSize = validateSsrBuildBatchSize(batchSize)!
  const renderQueue = [
    '404.md',
    ...sitePages.filter((page) => page !== '404.md')
  ]
  const batches: SsrBatchPlan[] = []

  for (let offset = 0; offset < renderQueue.length; offset += batchSize) {
    batches.push({
      offset,
      pages: renderQueue.slice(offset, offset + batchSize)
    })
  }

  return batches
}

const WORKER_ENTRYPOINT_FLAGS = new Set([
  '-c',
  '--check',
  '-i',
  '--interactive',
  '--test',
  '--watch',
  '--watch-preserve-output'
])

const WORKER_ENTRYPOINT_FLAGS_WITH_VALUES = new Set([
  '-e',
  '--eval',
  '-p',
  '--print',
  '--input-type',
  '--run',
  '--watch-path',
  '--test-concurrency',
  '--test-isolation',
  '--test-name-pattern',
  '--test-reporter',
  '--test-reporter-destination',
  '--test-shard',
  '--test-timeout'
])

export function createWorkerExecArgv(execArgv: string[]): string[] {
  const result: string[] = []
  for (let index = 0; index < execArgv.length; index++) {
    const argument = execArgv[index]

    if (argument === '--') continue

    const shortEntrypointFlags = /^-([ceip]+)$/.exec(argument)?.[1]
    if (shortEntrypointFlags) {
      if (/[ep]/.test(shortEntrypointFlags) && index + 1 < execArgv.length) {
        index++
      }
      continue
    }

    if (WORKER_ENTRYPOINT_FLAGS.has(argument)) continue

    const valueFlag = [...WORKER_ENTRYPOINT_FLAGS_WITH_VALUES].find(
      (flag) => argument === flag || argument.startsWith(`${flag}=`)
    )
    if (valueFlag) {
      if (argument === valueFlag && index + 1 < execArgv.length) index++
      continue
    }

    if (
      argument.startsWith('--test-') ||
      argument.startsWith('--experimental-test-') ||
      argument.startsWith('--watch-')
    ) {
      if (
        !argument.includes('=') &&
        index + 1 < execArgv.length &&
        !execArgv[index + 1].startsWith('-')
      ) {
        index++
      }
      continue
    }

    if (!argument.startsWith('--inspect')) result.push(argument)

    if (
      (argument === '--inspect-port' || argument === '--inspect-publish-uid') &&
      index + 1 < execArgv.length
    ) {
      index++
    }
  }

  // Inspector flags can also arrive through NODE_OPTIONS, which is inherited
  // by workers. Explicit command-line negatives take precedence there.
  for (const flag of [
    '--no-inspect',
    '--no-inspect-brk',
    '--no-inspect-wait'
  ]) {
    if (process.allowedNodeEnvironmentFlags.has(flag)) result.push(flag)
  }

  return result
}
