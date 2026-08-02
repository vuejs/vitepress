import { createVueDescriptorMemoryPlugin } from 'node/plugins/vueDescriptorMemory'
import type { Plugin } from 'vite'

describe('node/plugins/vueDescriptorMemory', () => {
  test('compacts tracked compiler results without mutating the shared compiler', () => {
    const { compiler, parseCacheClear } = createCompiler()
    const vuePlugin = createVuePlugin(compiler)
    const plugin = createVueDescriptorMemoryPlugin(vuePlugin)
    const originalParse = compiler.parse
    const originalCompileScript = compiler.compileScript

    getBuildStart(plugin).call({})

    const facade = (vuePlugin as any).api.options.compiler
    expect(facade).not.toBe(compiler)
    expect(compiler.parse).toBe(originalParse)
    expect(compiler.compileScript).toBe(originalCompileScript)

    const parsed = facade.parse('<template>large source</template>', {
      filename: '/one.md'
    })
    const script = facade.compileScript(parsed.descriptor)
    expect(plugin.api.retainedFiles).toBe(1)

    getHook(plugin.buildEnd).call({}, undefined)

    expect(plugin.api.retainedFiles).toBe(0)
    expect(parsed.descriptor.source).toBe('')
    expect(parsed.descriptor.template.content).toBe('')
    expect(parsed.descriptor.template.ast).toBeUndefined()
    expect(script.content).toBe('')
    expect(script.scriptAst).toBeUndefined()
    expect(parseCacheClear).toHaveBeenCalledTimes(1)
    expect((vuePlugin as any).api.options.compiler).toBe(facade)

    getHook(plugin.closeBundle).call({})
    expect((vuePlugin as any).api.options.compiler).toBe(compiler)
    expect(compiler.parse).toBe(originalParse)
    expect(compiler.compileScript).toBe(originalCompileScript)
  })

  test('isolates concurrent plugin instances that share compiler-sfc', () => {
    const { compiler } = createCompiler()
    const vueA = createVuePlugin(compiler)
    const vueB = createVuePlugin(compiler)
    const pluginA = createVueDescriptorMemoryPlugin(vueA)
    const pluginB = createVueDescriptorMemoryPlugin(vueB)

    getBuildStart(pluginA).call({})
    getBuildStart(pluginB).call({})

    const facadeA = (vueA as any).api.options.compiler
    const facadeB = (vueB as any).api.options.compiler
    expect(facadeA).not.toBe(facadeB)
    expect(compiler.parse).not.toBe(facadeA.parse)
    expect(compiler.parse).not.toBe(facadeB.parse)

    const descriptorA = facadeA.parse('source a', {
      filename: '/shared.md'
    }).descriptor
    const descriptorB = facadeB.parse('source b', {
      filename: '/shared.md'
    }).descriptor

    pluginA.api.release(['/shared.md'])
    expect(descriptorA.source).toBe('')
    expect(descriptorB.source).toBe('source b')

    getHook(pluginA.closeBundle).call({})
    expect((vueA as any).api.options.compiler).toBe(compiler)
    expect((vueB as any).api.options.compiler).toBe(facadeB)

    getHook(pluginB.closeBundle).call({})
    expect((vueB as any).api.options.compiler).toBe(compiler)
  })

  test('leases compiler-sfc parse-cache results across concurrent builds', () => {
    const { compiler } = createCompiler()
    const sharedDescriptor = compiler.parse('shared source', {
      filename: '/shared.md'
    }).descriptor
    compiler.parse.mockReturnValue({ descriptor: sharedDescriptor })
    const vueA = createVuePlugin(compiler)
    const vueB = createVuePlugin(compiler)
    const pluginA = createVueDescriptorMemoryPlugin(vueA)
    const pluginB = createVueDescriptorMemoryPlugin(vueB)

    getBuildStart(pluginA).call({})
    getBuildStart(pluginB).call({})
    ;(vueA as any).api.options.compiler.parse('shared source', {
      filename: '/shared.md'
    })
    ;(vueB as any).api.options.compiler.parse('shared source', {
      filename: '/shared.md'
    })

    pluginA.api.release(['/shared.md'])
    expect(sharedDescriptor.source).toBe('shared source')

    pluginB.api.release(['/shared.md'])
    expect(sharedDescriptor.source).toBe('')

    getHook(pluginA.closeBundle).call({})
    getHook(pluginB.closeBundle).call({})
  })

  test('restores its compiler facade when graph construction fails', () => {
    const { compiler } = createCompiler()
    const vuePlugin = createVuePlugin(compiler)
    const plugin = createVueDescriptorMemoryPlugin(vuePlugin)

    getBuildStart(plugin).call({})
    expect((vuePlugin as any).api.options.compiler).not.toBe(compiler)

    getHook(plugin.buildEnd).call({}, new Error('build failed'))
    expect((vuePlugin as any).api.options.compiler).toBe(compiler)
  })
})

function createCompiler() {
  const parseCacheClear = vi.fn()
  const compiler = {
    parse: vi.fn((source: string, options: { filename: string }) => ({
      descriptor: {
        filename: options.filename,
        source,
        template: {
          content: source,
          ast: { source },
          map: { source },
          loc: { source }
        },
        script: null,
        scriptSetup: null,
        styles: [],
        customBlocks: []
      }
    })),
    compileScript: vi.fn((descriptor: { filename: string }) => ({
      content: `compiled ${descriptor.filename}`,
      scriptAst: { filename: descriptor.filename },
      scriptSetupAst: { filename: descriptor.filename },
      deps: [descriptor.filename],
      imports: { value: true },
      bindings: { value: true }
    })),
    parseCache: { clear: parseCacheClear }
  }
  return { compiler, parseCacheClear }
}

function createVuePlugin(
  compiler: ReturnType<typeof createCompiler>['compiler']
): Plugin {
  return {
    name: 'vite:vue',
    api: {
      options: { compiler }
    }
  } as Plugin
}

function getBuildStart(plugin: Plugin): (...args: any[]) => any {
  const hook = plugin.buildStart
  if (!hook || typeof hook === 'function') {
    throw new Error('Expected an object buildStart hook.')
  }
  return hook.handler
}

function getHook<T extends (...args: any[]) => any>(
  hook: T | { handler: T } | undefined
): T {
  if (!hook) throw new Error('Expected plugin hook.')
  return typeof hook === 'function' ? hook : hook.handler
}
