import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { resolveConfig } from 'node/config'
import { notFoundPlugin } from 'node/plugins/notFoundPlugin'
import { normalizePath } from 'vite'

const locales = `locales: { root: { label: 'English', lang: 'en' }, zh: { label: '中文', lang: 'zh-CN' } }`

async function site(files: Record<string, string>, config = '') {
  const root = mkdtempSync(join(tmpdir(), 'vp-not-found-'))
  mkdirSync(join(root, '.vitepress'), { recursive: true })
  writeFileSync(
    join(root, '.vitepress/config.ts'),
    `export default { ${locales}, ${config} }`
  )
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(join(root, file, '..'), { recursive: true })
    writeFileSync(join(root, file), content)
  }
  const siteConfig = await resolveConfig(root, 'build', 'production')
  const plugin = notFoundPlugin(siteConfig)
  const hooks = {
    resolveId: (id: string) =>
      (plugin.resolveId as any).handler.call(undefined, id, undefined, {}),
    load: (id: string) => (plugin.load as any).handler.call(undefined, id)
  }
  const file = (page: string) => normalizePath(join(siteConfig.srcDir, page))
  return {
    siteConfig,
    ...hooks,
    file,
    cleanup: () => rmSync(root, { recursive: true })
  }
}

describe('node/plugins/notFoundPlugin', () => {
  test('synthesizes the pages nobody wrote', async () => {
    const s = await site({ 'index.md': '# Home' })
    try {
      expect(s.siteConfig.notFoundPages).toEqual([
        { path: '404.md', source: null },
        { path: 'zh/404.md', source: null }
      ])
      expect(s.resolveId('/zh/404.md')).toBe(s.file('zh/404.md'))
      expect(s.resolveId('/zh/404.md?t=123')).toBe(s.file('zh/404.md'))
      expect(s.load(s.file('404.md'))).toContain('<NotFound />')
      expect(s.load(s.file('zh/404.md'))).toContain('<NotFound />')
    } finally {
      s.cleanup()
    }
  })

  test('a locale without its own page re-exports the root one', async () => {
    const s = await site({ 'index.md': '# Home', '404.md': '# Lost' })
    try {
      expect(s.siteConfig.pages).not.toContain('404.md')
      expect(s.siteConfig.notFoundPages).toEqual([
        { path: '404.md', source: '404.md' },
        { path: 'zh/404.md', source: null }
      ])
      // the authored page loads as a file
      expect(s.resolveId(s.file('404.md'))).toBeUndefined()
      expect(s.load(s.file('404.md'))).toBeUndefined()
      // the inherited one is a virtual js module around it
      const id = s.resolveId('/zh/404.md')
      expect(id).toBe('\0' + s.file('zh/404.md'))
      const code = s.load(id)
      expect(code).toContain(`from ${JSON.stringify(s.file('404.md'))}`)
      expect(code).toContain(`relativePath: "zh/404.md"`)
      expect(code).not.toContain('<NotFound />')
    } finally {
      s.cleanup()
    }
  })

  test('a rewrite can move a page onto the not-found path', async () => {
    const s = await site(
      { 'index.md': '# Home', 'errors/lost.md': '# Lost' },
      `rewrites: { 'errors/lost.md': '404.md' }`
    )
    try {
      expect(s.siteConfig.pages).not.toContain('errors/lost.md')
      expect(s.siteConfig.notFoundPages[0]).toEqual({
        path: '404.md',
        source: 'errors/lost.md'
      })
      expect(s.load(s.file('zh/404.md'))).toContain(
        `from ${JSON.stringify(s.file('errors/lost.md'))}`
      )
    } finally {
      s.cleanup()
    }
  })

  test('a rewrite moving 404.md away leaves the file a regular page', async () => {
    const s = await site(
      { 'index.md': '# Home', '404.md': '# Moved' },
      `rewrites: { '404.md': 'moved/404.md' }`
    )
    try {
      expect(s.siteConfig.pages).toContain('404.md')
      expect(s.siteConfig.notFoundPages).toEqual([
        { path: '404.md', source: null },
        { path: 'zh/404.md', source: null }
      ])
      // the file keeps its own content; the not-found page is synthesized
      // from the theme instead
      expect(s.resolveId(s.file('404.md'))).toBeUndefined()
      expect(s.load(s.file('404.md'))).toBeUndefined()
      expect(s.load(s.file('zh/404.md'))).toContain('<NotFound />')
    } finally {
      s.cleanup()
    }
  })

  test('leaves sub-requests to the module that owns them', async () => {
    const s = await site({ 'index.md': '# Home', '404.md': '# Lost' })
    try {
      expect(
        s.resolveId('/zh/404.md?vue&type=style&index=0&lang.css')
      ).toBeUndefined()
      expect(s.load(s.file('zh/404.md') + '?vue&type=style')).toBeUndefined()
    } finally {
      s.cleanup()
    }
  })
})
