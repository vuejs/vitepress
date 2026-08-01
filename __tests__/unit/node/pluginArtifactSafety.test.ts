import { resolveConfig } from 'node/config'
import { PageArtifactStore } from 'node/pageArtifacts'
import { createVitePressPlugin } from 'node/plugin'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { Plugin } from 'vite'

describe('resolved plugin artifact safety', () => {
  let root: string | undefined

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
  })

  test('uses resolved-config plugins when deciding whether an artifact is reusable', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-resolved-plugins-'))
    const file = path.join(root, 'index.md')
    const source = '# Resolved plugin safety\n'
    await writeFile(file, source)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.markdown = { cache: false }
    siteConfig.vite = { plugins: [] }

    const compileWithResolvedPlugin = async (
      resolvedPlugin: Plugin,
      namespace: string
    ) => {
      const store = new PageArtifactStore(siteConfig.cacheDir, { namespace })
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
        build: { rolldownOptions: { plugins: [] } },
        command: 'build',
        plugins: [vitePressPlugin, resolvedPlugin],
        publicDir: siteConfig.publicDir
      } as any)

      const transform = getHookHandler(vitePressPlugin.transform as any)
      await transform.call(
        {
          addWatchFile() {},
          environment: { mode: 'build', name: 'client' }
        },
        source,
        file
      )
      return store.getCurrentMetadata('index.md')
    }

    const resolvedConfigFilePlugin: Plugin = {
      name: 'test:resolved-config-file-load',
      load: {
        filter: { id: /[.]md$/ },
        handler() {
          return null
        }
      }
    }
    expect(siteConfig.vite.plugins).not.toContain(resolvedConfigFilePlugin)
    await expect(
      compileWithResolvedPlugin(resolvedConfigFilePlugin, 'resolved-unsafe')
    ).resolves.toEqual({
      staticPage: false,
      requiresSourceModuleIdentity: true
    })

    const explicitlySafePlugin = {
      ...resolvedConfigFilePlugin,
      api: { vitepress: { ssrArtifactSafe: true } }
    } as Plugin
    await expect(
      compileWithResolvedPlugin(explicitlySafePlugin, 'resolved-safe')
    ).resolves.toEqual({
      staticPage: true,
      requiresSourceModuleIdentity: false
    })
  })
})

function getHookHandler<T extends (...args: any[]) => any>(
  hook: T | { handler: T } | undefined
): T {
  if (!hook) throw new Error('Expected plugin hook.')
  return typeof hook === 'function' ? hook : hook.handler
}
