import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { MarkdownItAsync } from 'markdown-it-async'
import {
  mergeConfig,
  normalizeAssetsBase,
  normalizeSiteBase,
  resolveConfig,
  type UserConfig
} from 'node/config'
import { normalizePath } from 'vite'

describe('node/config', () => {
  test('merges markdown hooks from extended configs', async () => {
    const calls: string[] = []
    const md = {} as MarkdownItAsync

    const merged = mergeConfig<UserConfig, UserConfig>(
      {
        markdown: {
          lineNumbers: true,
          preConfig() {
            calls.push('base-pre')
          },
          config() {
            calls.push('base')
          }
        }
      },
      {
        markdown: {
          attrs: {
            allowed: ['id']
          },
          async preConfig() {
            calls.push('extended-pre')
          },
          async config() {
            calls.push('extended')
          }
        }
      }
    )

    expect(merged.markdown?.lineNumbers).toBe(true)
    expect(merged.markdown?.attrs).toEqual({
      allowed: ['id']
    })

    await merged.markdown?.preConfig?.(md)
    await merged.markdown?.config?.(md)

    expect(calls).toEqual(['base-pre', 'extended-pre', 'base', 'extended'])
  })

  test('keeps one-sided markdown hooks when the other config omits them', async () => {
    const calls: string[] = []
    const md = {} as MarkdownItAsync

    const merged = mergeConfig<UserConfig, UserConfig>(
      {
        markdown: {
          preConfig() {
            calls.push('base-pre')
          }
        }
      },
      {
        markdown: {
          config() {
            calls.push('extended')
          }
        }
      }
    )

    await merged.markdown?.preConfig?.(md)
    await merged.markdown?.config?.(md)

    expect(calls).toEqual(['base-pre', 'extended'])
  })

  test('resolves a symlinked srcDir to its real path', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vitepress-srcdir-'))
    try {
      const real = path.join(tmp, 'real-docs')
      const root = path.join(tmp, 'site')
      fs.mkdirSync(real)
      fs.writeFileSync(path.join(real, 'index.md'), '# Hello')
      fs.mkdirSync(path.join(root, '.vitepress'), { recursive: true })
      fs.writeFileSync(
        path.join(root, '.vitepress/config.mjs'),
        "export default { srcDir: 'docs' }"
      )
      fs.symlinkSync(real, path.join(root, 'docs'), 'junction')

      const config = await resolveConfig(root, 'build')

      expect(config.srcDir).toBe(normalizePath(fs.realpathSync(real)))
      expect(config.pages).toEqual(['index.md'])
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })
})

describe('node/config base normalization', () => {
  describe('normalizeSiteBase', () => {
    test('defaults to / and appends the trailing slash', () => {
      expect(normalizeSiteBase(undefined)).toBe('/')
      expect(normalizeSiteBase('')).toBe('/')
      expect(normalizeSiteBase('/docs')).toBe('/docs/')
      expect(normalizeSiteBase('/docs/')).toBe('/docs/')
    })

    test('coerces a leading slash onto path bases', () => {
      expect(normalizeSiteBase('docs')).toBe('/docs/')
      expect(normalizeSiteBase('docs/')).toBe('/docs/')
      expect(normalizeSiteBase('https://example.com/x')).toBe(
        'https://example.com/x/'
      )
      expect(normalizeSiteBase('//cdn.example.com/')).toBe('//cdn.example.com/')
    })

    test('normalizes relative forms to ./', () => {
      expect(normalizeSiteBase('.')).toBe('./')
      expect(normalizeSiteBase('./')).toBe('./')
    })

    test('rejects relative bases with a subpath', () => {
      expect(() => normalizeSiteBase('./docs/')).toThrow(/relative base/)
      expect(() => normalizeSiteBase('../x')).toThrow(/relative base/)
    })
  })

  describe('normalizeAssetsBase', () => {
    test('accepts absolute urls, protocol-relative urls and paths', () => {
      expect(normalizeAssetsBase('https://cdn.example.com')).toBe(
        'https://cdn.example.com/'
      )
      expect(normalizeAssetsBase('//cdn.example.com/x')).toBe(
        '//cdn.example.com/x/'
      )
      expect(normalizeAssetsBase('/cdn/')).toBe('/cdn/')
    })

    test('rejects relative values', () => {
      expect(() => normalizeAssetsBase('./cdn/')).toThrow(/assetsBase/)
      expect(() => normalizeAssetsBase('cdn/')).toThrow(/assetsBase/)
    })
  })
})
