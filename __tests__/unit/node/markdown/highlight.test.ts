import type { MarkdownOptions } from 'node/markdown/markdown'
import { highlight } from 'node/markdown/plugins/highlight'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

describe('persistent Shiki highlight cache', () => {
  let root: string | undefined

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
  })

  test('reuses highlighted HTML without initializing a second renderer', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-shiki-cache-'))

    let setupCalls = 0
    let failIfInitialized = false
    const options: MarkdownOptions = {
      shikiCacheKey: 'persistent-cache-test-v1',
      async shikiSetup() {
        setupCalls++
        if (failIfInitialized) {
          throw new Error('the persistent cache was not used')
        }
      }
    }
    const logger = { warn: vi.fn() }

    const [firstHighlight, disposeFirst] = await highlight(
      'github-light',
      options,
      logger,
      root
    )
    const first = await firstHighlight('const persistent = true', 'js', '{1}')
    disposeFirst()

    failIfInitialized = true
    const [secondHighlight, disposeSecond] = await highlight(
      'github-light',
      options,
      logger,
      root
    )
    const second = await secondHighlight('const persistent = true', 'js', '{1}')
    disposeSecond()

    expect(second).toBe(first)
    expect(second).toContain('const')
    expect(setupCalls).toBe(1)
    expect(logger.warn).not.toHaveBeenCalled()
  })
})
