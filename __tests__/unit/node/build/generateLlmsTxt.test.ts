import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { Logger } from 'vite'
import { generateLlmsTxt } from 'node/build/generateLlmsTxt'
import type { SiteConfig } from 'node/siteConfig'

const logger = {
  info() {},
  warn() {},
  error() {}
} as unknown as Logger

function writeFixture(dir: string, files: Record<string, string>) {
  for (const [file, content] of Object.entries(files)) {
    const abs = path.join(dir, file)
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, content)
  }
}

describe('node/build/generateLlmsTxt', () => {
  let srcDir: string
  let outDir: string

  beforeEach(() => {
    srcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-llms-src-'))
    outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-llms-out-'))

    writeFixture(srcDir, {
      'index.md': [
        '---',
        'layout: home',
        'hero:',
        '  name: Test Site',
        '  text: A test site for LLMs',
        '---'
      ].join('\n'),
      'guide/index.md': '# Getting Started\n\nWelcome to the guide.',
      'guide/advanced.md': [
        '---',
        'title: Advanced Guide',
        'description: Advanced usage patterns',
        '---',
        '',
        '# Advanced',
        '',
        'Advanced content.'
      ].join('\n'),
      'api/reference.md': '# API Reference\n\n<!-- @include: ./shared.md -->\n',
      'api/shared.md': 'Shared API notes.',
      'fr/guide.md': '# Guide en français',
      'unlisted.md': '# Unlisted Page'
    })
  })

  afterEach(() => {
    fs.rmSync(srcDir, { recursive: true, force: true })
    fs.rmSync(outDir, { recursive: true, force: true })
  })

  function makeConfig(overrides: Partial<SiteConfig> = {}): SiteConfig {
    return {
      srcDir,
      outDir,
      pages: [
        'api/reference.md',
        'data/1.md',
        'fr/guide.md',
        'guide/advanced.md',
        'guide/index.md',
        'index.md',
        'unlisted.md'
      ],
      dynamicRoutes: [{ path: 'data/1.md' }],
      rewrites: { map: {}, inv: {} },
      cleanUrls: false,
      markdown: {},
      logger,
      site: {
        title: 'Fallback Title',
        description: 'Fallback description',
        base: '/',
        locales: {
          root: { label: 'English', lang: 'en-US' },
          fr: { label: 'Français', lang: 'fr-FR' }
        },
        themeConfig: {
          sidebar: [
            {
              text: 'Guide',
              items: [
                { text: 'Getting Started', link: '/guide/' },
                { text: 'Advanced', link: '/guide/advanced' }
              ]
            },
            {
              text: 'API',
              items: [{ text: 'Reference', link: '/api/reference' }]
            }
          ]
        }
      },
      userConfig: {
        locales: {
          root: { label: 'English', lang: 'en-US' },
          fr: { label: 'Français', lang: 'fr-FR' }
        }
      },
      llms: { hostname: 'https://example.com' },
      ...overrides
    } as unknown as SiteConfig
  }

  test('does nothing when llms is not enabled', async () => {
    await generateLlmsTxt(makeConfig({ llms: undefined }))
    expect(fs.existsSync(path.join(outDir, 'llms.txt'))).toBe(false)
  })

  test('does nothing when llms.enabled is false', async () => {
    await generateLlmsTxt(
      makeConfig({
        llms: { enabled: false, hostname: 'https://example.com' }
      })
    )
    expect(fs.existsSync(path.join(outDir, 'llms.txt'))).toBe(false)
  })

  test('generates llms.txt with hero metadata and sidebar-ordered TOC', async () => {
    await generateLlmsTxt(makeConfig())

    const llmsTxt = fs.readFileSync(path.join(outDir, 'llms.txt'), 'utf-8')

    expect(llmsTxt).toContain('# Test Site')
    expect(llmsTxt).toContain('> A test site for LLMs')

    expect(llmsTxt).toContain('### Guide')
    expect(llmsTxt).toContain(
      '- [Getting Started](https://example.com/guide.md)'
    )
    expect(llmsTxt).toContain(
      '- [Advanced Guide](https://example.com/guide/advanced.md): Advanced usage patterns'
    )
    expect(llmsTxt).toContain('### API')
    expect(llmsTxt).toContain(
      '- [API Reference](https://example.com/api/reference.md)'
    )

    // pages not in the sidebar are appended at the end
    expect(llmsTxt).toContain(
      '- [Unlisted Page](https://example.com/unlisted.md)'
    )

    // sidebar order is preserved
    expect(llmsTxt.indexOf('Getting Started')).toBeLessThan(
      llmsTxt.indexOf('Advanced Guide')
    )
    expect(llmsTxt.indexOf('Advanced Guide')).toBeLessThan(
      llmsTxt.indexOf('API Reference')
    )
  })

  test('emits per-page markdown files with url frontmatter', async () => {
    await generateLlmsTxt(makeConfig())

    // dir/index.md collapses to dir.md
    const guide = fs.readFileSync(path.join(outDir, 'guide.md'), 'utf-8')
    expect(guide).toContain('url: "https://example.com/guide.md"')
    expect(guide).toContain('# Getting Started')

    const advanced = fs.readFileSync(
      path.join(outDir, 'guide/advanced.md'),
      'utf-8'
    )
    expect(advanced).toContain('url: "https://example.com/guide/advanced.md"')
    expect(advanced).toContain('description: "Advanced usage patterns"')
    // original frontmatter is replaced
    expect(advanced).not.toContain('title: Advanced Guide')

    // includes are expanded
    const reference = fs.readFileSync(
      path.join(outDir, 'api/reference.md'),
      'utf-8'
    )
    expect(reference).toContain('Shared API notes.')
    expect(reference).not.toContain('@include')
  })

  test('generates llms-full.txt with all pages in TOC order', async () => {
    await generateLlmsTxt(makeConfig())

    const full = fs.readFileSync(path.join(outDir, 'llms-full.txt'), 'utf-8')

    expect(full).toContain('# Getting Started')
    expect(full).toContain('Advanced content.')
    expect(full).toContain('Shared API notes.')
    expect(full).toContain('# Unlisted Page')

    expect(full.indexOf('# Getting Started')).toBeLessThan(
      full.indexOf('Advanced content.')
    )
  })

  test('skips non-root locales and dynamic routes', async () => {
    await generateLlmsTxt(makeConfig())

    expect(fs.existsSync(path.join(outDir, 'fr/guide.md'))).toBe(false)
    expect(fs.existsSync(path.join(outDir, 'data/1.md'))).toBe(false)

    const full = fs.readFileSync(path.join(outDir, 'llms-full.txt'), 'utf-8')
    expect(full).not.toContain('français')
  })

  test('applies rewrites to output paths and links', async () => {
    await generateLlmsTxt(
      makeConfig({
        rewrites: {
          map: { 'guide/advanced.md': 'advanced.md' },
          inv: { 'advanced.md': 'guide/advanced.md' }
        }
      })
    )

    expect(fs.existsSync(path.join(outDir, 'advanced.md'))).toBe(true)
    expect(fs.existsSync(path.join(outDir, 'guide/advanced.md'))).toBe(false)

    const llmsTxt = fs.readFileSync(path.join(outDir, 'llms.txt'), 'utf-8')
    expect(llmsTxt).toContain('(https://example.com/advanced.md)')
  })

  test('detects the landing page through rewrites (en/index.md -> index.md)', async () => {
    fs.rmSync(path.join(srcDir, 'index.md'))
    writeFixture(srcDir, {
      'en/index.md': [
        '---',
        'layout: home',
        'hero:',
        '  name: Rewritten Site',
        '  text: Rewritten description',
        '---'
      ].join('\n'),
      'en/guide.md': '# Rewritten Guide'
    })

    const config = makeConfig({
      pages: ['en/guide.md', 'en/index.md', 'unlisted.md'],
      rewrites: {
        map: { 'en/index.md': 'index.md', 'en/guide.md': 'guide.md' },
        inv: { 'index.md': 'en/index.md', 'guide.md': 'en/guide.md' }
      }
    })

    await generateLlmsTxt(config)

    const llmsTxt = fs.readFileSync(path.join(outDir, 'llms.txt'), 'utf-8')
    expect(llmsTxt).toContain('# Rewritten Site')
    expect(llmsTxt).toContain('> Rewritten description')
    expect(llmsTxt).toContain(
      '- [Rewritten Guide](https://example.com/guide.md)'
    )

    // the landing page is not emitted nor listed
    expect(fs.existsSync(path.join(outDir, 'index.md'))).toBe(false)
    expect(llmsTxt).not.toContain('](https://example.com/index.md)')
  })

  test('resolves the sidebar from additional config layers', async () => {
    const config = makeConfig()
    delete (config.site.themeConfig as any).sidebar
    ;(config.site as any).additionalConfig = {
      '/': {
        themeConfig: {
          sidebar: [
            {
              text: 'Layered',
              items: [{ text: 'Advanced', link: '/guide/advanced' }]
            }
          ]
        }
      }
    }

    await generateLlmsTxt(config)

    const llmsTxt = fs.readFileSync(path.join(outDir, 'llms.txt'), 'utf-8')
    expect(llmsTxt).toContain('### Layered')
    expect(llmsTxt.indexOf('Advanced Guide')).toBeLessThan(
      llmsTxt.indexOf('### Other')
    )
  })

  test('falls back to site title/description and flat TOC without sidebar', async () => {
    const config = makeConfig()
    delete (config.site.themeConfig as any).sidebar
    fs.rmSync(path.join(srcDir, 'index.md'))
    config.pages = config.pages.filter((p) => p !== 'index.md')

    await generateLlmsTxt(config)

    const llmsTxt = fs.readFileSync(path.join(outDir, 'llms.txt'), 'utf-8')
    expect(llmsTxt).toContain('# Fallback Title')
    expect(llmsTxt).toContain('> Fallback description')
    expect(llmsTxt).toContain('- [Advanced Guide](')
  })

  test('respects base in generated links', async () => {
    const config = makeConfig()
    config.site.base = '/docs/'

    await generateLlmsTxt(config)

    const llmsTxt = fs.readFileSync(path.join(outDir, 'llms.txt'), 'utf-8')
    expect(llmsTxt).toContain('(https://example.com/docs/guide.md)')
  })

  test('skips pages matching ignoreFiles patterns', async () => {
    await generateLlmsTxt(
      makeConfig({
        llms: { hostname: 'https://example.com', ignoreFiles: ['api/**'] }
      })
    )

    expect(fs.existsSync(path.join(outDir, 'api/reference.md'))).toBe(false)
    expect(fs.existsSync(path.join(outDir, 'guide/advanced.md'))).toBe(true)

    const llmsTxt = fs.readFileSync(path.join(outDir, 'llms.txt'), 'utf-8')
    expect(llmsTxt).not.toContain('API Reference')

    const full = fs.readFileSync(path.join(outDir, 'llms-full.txt'), 'utf-8')
    expect(full).not.toContain('Shared API notes.')
  })

  test('matches ignoreFiles against rewritten output paths too', async () => {
    await generateLlmsTxt(
      makeConfig({
        llms: {
          hostname: 'https://example.com',
          ignoreFiles: ['advanced.md']
        },
        rewrites: {
          map: { 'guide/advanced.md': 'advanced.md' },
          inv: { 'advanced.md': 'guide/advanced.md' }
        }
      })
    )

    expect(fs.existsSync(path.join(outDir, 'advanced.md'))).toBe(false)

    const llmsTxt = fs.readFileSync(path.join(outDir, 'llms.txt'), 'utf-8')
    expect(llmsTxt).not.toContain('Advanced Guide')
  })

  test('unwraps llm-only and drops llm-exclude in LLM output', async () => {
    writeFixture(srcDir, {
      'tags.md': [
        '# Tags',
        '',
        '<llm-only>',
        '',
        'Secret for LLMs.',
        '',
        '</llm-only>',
        '',
        '<llm-exclude>',
        'Humans only.',
        '</llm-exclude>',
        '',
        'Shared content.'
      ].join('\n')
    })

    const config = makeConfig()
    config.pages = [...config.pages, 'tags.md']

    await generateLlmsTxt(config)

    const tags = fs.readFileSync(path.join(outDir, 'tags.md'), 'utf-8')
    expect(tags).toContain('Secret for LLMs.')
    expect(tags).toContain('Shared content.')
    expect(tags).not.toContain('Humans only.')
    expect(tags).not.toContain('llm-only')
    expect(tags).not.toContain('llm-exclude')
  })
})
