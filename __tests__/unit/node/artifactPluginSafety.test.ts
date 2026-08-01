import { resolveConfig } from 'node/config'
import {
  canCompileSsrPageArtifact,
  canReuseSsrPageArtifactWithPlugins
} from 'node/markdownToVue'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

describe('SSR artifact plugin safety', () => {
  let root: string | undefined

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
  })

  test('checks plugins discovered in resolved environments and honors the explicit safety contract', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-resolved-hooks-'))
    const file = path.join(root, 'index.md')
    await writeFile(file, '# Resolved plugin\n')

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.vite = { plugins: [] }
    expect(canCompileSsrPageArtifact(siteConfig, file)).toBe(true)

    const resolvedConfigFilePlugin = {
      name: 'config-file-markdown-load',
      load: {
        filter: { id: /[.]md$/ },
        handler() {
          return null
        }
      }
    }
    expect(
      canReuseSsrPageArtifactWithPlugins([resolvedConfigFilePlugin], file)
    ).toBe(false)

    const explicitlySafeResolvedPlugin = {
      ...resolvedConfigFilePlugin,
      api: { vitepress: { ssrArtifactSafe: true } }
    }
    expect(
      canReuseSsrPageArtifactWithPlugins([explicitlySafeResolvedPlugin], file)
    ).toBe(true)
  })

  test('checks the plugin produced by applyToEnvironment after resolution', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-environment-hooks-'))
    const file = path.join(root, 'index.md')
    await writeFile(file, '# Per-environment plugin\n')

    const environmentPlugin = {
      name: 'config-file-per-environment',
      applyToEnvironment(environment: { name: string }) {
        return {
          name: `config-file-per-environment:${environment.name}`,
          enforce: 'pre' as const,
          transform: {
            filter: { id: /[.]md$/ },
            handler(code: string, _id: string, options?: { ssr?: boolean }) {
              return `${code}\n${options?.ssr ? 'server' : 'client'}`
            }
          }
        }
      }
    }
    const resolvedSsrPlugin = environmentPlugin.applyToEnvironment({
      name: 'ssr'
    })

    expect(canReuseSsrPageArtifactWithPlugins([resolvedSsrPlugin], file)).toBe(
      false
    )
  })
})
