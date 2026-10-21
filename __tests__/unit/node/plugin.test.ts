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
  let server: Awaited<ReturnType<typeof createServer>> | undefined
  let hotSend: any

  beforeEach(async () => {
    clearCache()
    disposeMdItInstance()
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-plugin-'))
  })

  afterEach(async () => {
    await server?.close()
    server = undefined
    clearCache()
    disposeMdItInstance()
    await rm(root, { recursive: true, force: true })
  })

  async function startServer(options: {
    crossPageTransform: boolean
    transformPageDataHmr?: boolean
  }) {
    const transformPageDataHmr =
      options.transformPageDataHmr == null
        ? []
        : [`  transformPageDataHmr: ${options.transformPageDataHmr},`]

    await mkdir(path.join(root, '.vitepress'))
    await writeFile(
      path.join(root, '.vitepress', 'config.mjs'),
      options.crossPageTransform
        ? [
            "import { readFileSync } from 'node:fs'",
            '',
            'export default {',
            ...transformPageDataHmr,
            '  transformPageData() {',
            "    const source = readFileSync(new URL('../source.md', import.meta.url), 'utf-8')",
            '    const label = source.match(/^label:\\s*(.+)$/m)?.[1]',
            '    return { sharedLabel: label }',
            '  }',
            '}'
          ].join('\n')
        : [
            'export default {',
            ...transformPageDataHmr,
            '  transformPageData(pageData) {',
            '    return { localTitle: pageData.title }',
            '  }',
            '}'
          ].join('\n')
    )
    await writeFile(
      path.join(root, 'source.md'),
      ['---', 'label: Initial', '---', '', '# Source', ''].join('\n')
    )
    await writeFile(
      path.join(root, 'dependent.md'),
      options.crossPageTransform
        ? '# Dependent\n'
        : ['---', 'title: Initial', '---', '', '# Dependent', ''].join('\n')
    )

    server = await createServer(root, {
      port: await getPort(),
      watch: { usePolling: true, interval: 50 }
    })
    await server.listen()
    hotSend = vi.spyOn(server.environments.client.hot, 'send')
  }

  async function startDynamicRouteServer() {
    await mkdir(path.join(root, '.vitepress'))
    await writeFile(
      path.join(root, '.vitepress', 'config.mjs'),
      ['export default {', '  transformPageDataHmr: true', '}'].join('\n')
    )
    await writeFile(
      path.join(root, 'source.md'),
      ['---', 'label: Initial', '---', '', '# Source', ''].join('\n')
    )
    await mkdir(path.join(root, 'dynamic'))
    await writeFile(path.join(root, 'dynamic', '[id].md'), '# Dynamic\n')
    await writeFile(
      path.join(root, 'dynamic', '[id].paths.mjs'),
      [
        "import { readFileSync } from 'node:fs'",
        '',
        'export default {',
        "  paths: [{ params: { id: 'foo' } }],",
        '  transformPageData() {',
        "    const source = readFileSync(new URL('../source.md', import.meta.url), 'utf-8')",
        '    const label = source.match(/^label:\\s*(.+)$/m)?.[1]',
        '    return { sharedLabel: label }',
        '  }',
        '}'
      ].join('\n')
    )

    server = await createServer(root, {
      port: await getPort(),
      watch: { usePolling: true, interval: 50 }
    })
    await server.listen()
    hotSend = vi.spyOn(server.environments.client.hot, 'send')
  }

  function waitForChange(file: string) {
    const normalizedFile = normalizePath(file)

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        server?.watcher.off('change', onChange)
        reject(new Error(`Timed out waiting for ${file} to change`))
      }, 10_000)

      const onChange = (changedFile: string) => {
        if (normalizePath(changedFile) !== normalizedFile) return
        clearTimeout(timeout)
        server?.watcher.off('change', onChange)
        resolve()
      }

      server!.watcher.on('change', onChange)
    })
  }

  async function waitForPageData(url: string, value: string) {
    await expect
      .poll(async () => (await server!.transformRequest(url))?.code ?? '', {
        timeout: 5_000
      })
      .toContain(value)
  }

  test('refreshes dependent page data when cross-page HMR is enabled', async () => {
    await startServer({ crossPageTransform: true, transformPageDataHmr: true })

    const sourceFile = path.join(root, 'source.md')
    await waitForPageData('/dependent.md', '\\"sharedLabel\\":\\"Initial\\"')
    let sendStart = hotSend.mock.calls.length

    const firstChange = waitForChange(sourceFile)
    await writeFile(
      sourceFile,
      ['---', 'label: Updated', '---', '', '# Source', ''].join('\n')
    )
    await firstChange

    await expect
      .poll(
        () =>
          hotSend.mock.calls
            .slice(sendStart)
            .some(
              ([payload]: [{ type?: string }]) => payload.type === 'full-reload'
            ),
        { timeout: 5_000 }
      )
      .toBe(true)
    await waitForPageData('/dependent.md', '\\"sharedLabel\\":\\"Updated\\"')

    sendStart = hotSend.mock.calls.length
    const secondChange = waitForChange(sourceFile)
    await writeFile(
      sourceFile,
      ['---', 'label: Final', '---', '', '# Source', ''].join('\n')
    )
    await secondChange

    await expect
      .poll(
        () =>
          hotSend.mock.calls
            .slice(sendStart)
            .some(
              ([payload]: [{ type?: string }]) => payload.type === 'full-reload'
            ),
        { timeout: 5_000 }
      )
      .toBe(true)
    await waitForPageData('/dependent.md', '\\"sharedLabel\\":\\"Final\\"')
  }, 30_000)

  test('does not globally reload cross-page data without the opt-in', async () => {
    await startServer({ crossPageTransform: true })

    const sourceFile = path.join(root, 'source.md')
    await waitForPageData('/dependent.md', '\\"sharedLabel\\":\\"Initial\\"')
    const sendStart = hotSend.mock.calls.length

    const change = waitForChange(sourceFile)
    await writeFile(
      sourceFile,
      ['---', 'label: Updated', '---', '', '# Source', ''].join('\n')
    )
    await change

    await expect
      .poll(() => hotSend.mock.calls.length, { timeout: 5_000 })
      .toBeGreaterThan(sendStart)
    expect(
      hotSend.mock.calls
        .slice(sendStart)
        .some(
          ([payload]: [{ type?: string }]) => payload.type === 'full-reload'
        )
    ).toBe(false)
    await waitForPageData('/dependent.md', '\\"sharedLabel\\":\\"Initial\\"')
  }, 30_000)

  test('keeps page-local HMR when cross-page HMR is disabled', async () => {
    await startServer({
      crossPageTransform: false,
      transformPageDataHmr: false
    })

    const dependentFile = path.join(root, 'dependent.md')
    await waitForPageData('/dependent.md', '\\"localTitle\\":\\"Initial\\"')
    const sendStart = hotSend.mock.calls.length

    const change = waitForChange(dependentFile)
    await writeFile(
      dependentFile,
      ['---', 'title: Updated', '---', '', '# Dependent', ''].join('\n')
    )
    await change

    await waitForPageData('/dependent.md', '\\"localTitle\\":\\"Updated\\"')
    await expect
      .poll(() => hotSend.mock.calls.length, { timeout: 5_000 })
      .toBeGreaterThan(sendStart)

    expect(
      hotSend.mock.calls
        .slice(sendStart)
        .some(
          ([payload]: [{ type?: string }]) => payload.type === 'full-reload'
        )
    ).toBe(false)
  }, 30_000)

  test('refreshes dynamic-route page data when cross-page HMR is enabled', async () => {
    await startDynamicRouteServer()

    const sourceFile = path.join(root, 'source.md')
    await waitForPageData('/dynamic/foo.md', '\\"sharedLabel\\":\\"Initial\\"')
    let sendStart = hotSend.mock.calls.length

    const firstChange = waitForChange(sourceFile)
    await writeFile(
      sourceFile,
      ['---', 'label: Updated', '---', '', '# Source', ''].join('\n')
    )
    await firstChange

    await expect
      .poll(
        () =>
          hotSend.mock.calls
            .slice(sendStart)
            .some(
              ([payload]: [{ type?: string }]) => payload.type === 'full-reload'
            ),
        { timeout: 5_000 }
      )
      .toBe(true)
    await waitForPageData('/dynamic/foo.md', '\\"sharedLabel\\":\\"Updated\\"')

    sendStart = hotSend.mock.calls.length
    const secondChange = waitForChange(sourceFile)
    await writeFile(
      sourceFile,
      ['---', 'label: Final', '---', '', '# Source', ''].join('\n')
    )
    await secondChange

    await expect
      .poll(
        () =>
          hotSend.mock.calls
            .slice(sendStart)
            .some(
              ([payload]: [{ type?: string }]) => payload.type === 'full-reload'
            ),
        { timeout: 5_000 }
      )
      .toBe(true)
    await waitForPageData('/dynamic/foo.md', '\\"sharedLabel\\":\\"Final\\"')
  }, 30_000)
})
