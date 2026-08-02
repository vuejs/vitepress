import { resolveConfig } from 'node/config'
import { PageArtifactStore } from 'node/pageArtifacts'
import { createVitePressPlugin } from 'node/plugin'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { normalizePath, type Plugin } from 'vite'

describe('node/plugin coordinator client', () => {
  let root: string | undefined

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
  })

  test('initializes Markdown and preloads resolved pages through the client graph', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-client-preload-'))
    await Promise.all([
      writeFile(path.join(root, 'one.md'), '# One\n'),
      writeFile(path.join(root, 'two.md'), '# Two\n')
    ])

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const configureMarkdown = vi.fn()
    const userPostBuildStart = vi.fn()
    const userPlugin: Plugin = {
      name: 'test:user-post-build-start',
      enforce: 'post',
      buildStart: {
        order: 'post',
        handler: userPostBuildStart
      }
    }
    siteConfig.markdown = { cache: false, config: configureMarkdown }
    siteConfig.vite = { plugins: [userPlugin] }
    siteConfig.buildConcurrency = 1
    const store = new PageArtifactStore(siteConfig.cacheDir, {
      namespace: 'client-preload'
    })
    const plugins = await createVitePressPlugin(
      siteConfig,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        coordinatorClient: true,
        pageArtifactStore: store,
        skipGitScan: true
      }
    )
    const vitePressPlugin = plugins[0] as Plugin
    const configResolved = getHookHandler(vitePressPlugin.configResolved)
    await configResolved.call(undefined, {
      base: '/',
      command: 'build',
      publicDir: siteConfig.publicDir
    } as any)

    // This lifecycle runs when all pages are warm. The highlighter remains
    // idle until a Markdown cache miss needs it.
    expect(configureMarkdown).toHaveBeenCalledTimes(1)

    const preloadPlugin = plugins.at(-1) as Plugin
    expect(preloadPlugin.name).toBe('vitepress:coordinator-page-preload')
    expect(preloadPlugin.enforce).toBe('post')
    expect(plugins.indexOf(userPlugin)).toBeLessThan(
      plugins.indexOf(preloadPlugin)
    )
    const buildStart = preloadPlugin.buildStart as unknown as {
      order: string
      sequential: boolean
      handler: (...args: any[]) => Promise<void>
    }
    expect(buildStart.order).toBe('post')
    expect(buildStart.sequential).toBe(true)

    let activeLoads = 0
    let peakLoads = 0
    const resolve = vi.fn(async (id: string) => ({ id }))
    const load = vi.fn(
      async (_options: { id: string; resolveDependencies: boolean }) => {
        expect(userPostBuildStart).toHaveBeenCalledTimes(1)
        activeLoads++
        peakLoads = Math.max(peakLoads, activeLoads)
        await Promise.resolve()
        activeLoads--
        return {} as any
      }
    )
    await getHookHandler(userPlugin.buildStart).call({})
    await buildStart.handler.call({ resolve, load })

    const expectedIds = siteConfig.pages.map((page) =>
      normalizePath(path.resolve(siteConfig.srcDir, page))
    )
    expect(resolve.mock.calls.map(([id]) => id)).toEqual(expectedIds)
    expect(load.mock.calls.map(([options]) => options)).toEqual(
      expectedIds.map((id) => ({ id, resolveDependencies: true }))
    )
    expect(peakLoads).toBe(1)
  })

  test('does not let an isolated SSR phase replace the client public directory', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-ssr-public-dir-'))
    await writeFile(path.join(root, 'index.md'), '# Page\n')

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const clientPublicDir = siteConfig.publicDir
    const plugins = await createVitePressPlugin(
      siteConfig,
      true,
      undefined,
      undefined,
      undefined,
      undefined,
      { isSsrBatch: true, skipGitScan: true }
    )
    const vitePressPlugin = plugins[0] as Plugin
    const configResolved = getHookHandler(vitePressPlugin.configResolved)
    await configResolved.call(undefined, {
      base: '/',
      command: 'build',
      publicDir: path.join(root, 'runtime-public')
    } as any)

    expect(siteConfig.publicDir).toBe(clientPublicDir)
  })
})

function getHookHandler<T extends (...args: any[]) => any>(
  hook: T | { handler: T } | undefined
): T {
  if (!hook) throw new Error('Expected plugin hook.')
  return typeof hook === 'function' ? hook : hook.handler
}
