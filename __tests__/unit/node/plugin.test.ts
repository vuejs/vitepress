import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import getPort from 'get-port'
import { createServer } from 'node/server'
import { clearCache } from 'node/markdownToVue'
import { disposeMdItInstance } from 'node/markdown/markdown'
import { normalizePath } from 'vite'

describe('node/plugin', () => {
  let root: string
  let server: Awaited<ReturnType<typeof createServer>>

  beforeEach(async () => {
    clearCache()
    disposeMdItInstance()

    root = await mkdtemp(path.join(tmpdir(), 'vitepress-plugin-'))
    await mkdir(path.join(root, '.vitepress'))
    await writeFile(
      path.join(root, '.vitepress', 'config.mjs'),
      [
        "import { readFileSync } from 'node:fs'",
        '',
        'export default {',
        '  transformPageData() {',
        "    const source = readFileSync(new URL('../source.md', import.meta.url), 'utf-8')",
        '    const label = source.match(/^label:\\s*(.+)$/m)?.[1]',
        '    return { sharedLabel: label }',
        '  }',
        '}'
      ].join('\n')
    )
    await writeFile(
      path.join(root, 'source.md'),
      ['---', 'label: Initial', '---', '', '# Source', ''].join('\n')
    )
    await writeFile(path.join(root, 'dependent.md'), '# Dependent\n')

    server = await createServer(root, {
      port: await getPort(),
      watch: { usePolling: true, interval: 50 }
    })
    await server.listen()
  })

  afterEach(async () => {
    await server.close()
    clearCache()
    disposeMdItInstance()
    await rm(root, { recursive: true, force: true })
  })

  test('refreshes cached pages when another markdown page changes', async () => {
    const sourceFile = normalizePath(path.join(root, 'source.md'))

    const initial = await server.transformRequest('/dependent.md')
    expect(initial?.code).toContain('\\"sharedLabel\\":\\"Initial\\"')

    const sourceChanged = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        server.watcher.off('change', onChange)
        reject(new Error('Timed out waiting for source.md to change'))
      }, 10_000)

      const onChange = (file: string) => {
        if (normalizePath(file) !== sourceFile) return
        clearTimeout(timeout)
        server.watcher.off('change', onChange)
        resolve()
      }

      server.watcher.on('change', onChange)
    })

    await writeFile(
      path.join(root, 'source.md'),
      ['---', 'label: Updated', '---', '', '# Source', ''].join('\n')
    )
    await sourceChanged

    await expect
      .poll(
        async () =>
          (await server.transformRequest('/dependent.md'))?.code ?? '',
        { timeout: 2_000 }
      )
      .toContain('\\"sharedLabel\\":\\"Updated\\"')
  }, 15_000)
})
