import type { MarkdownItAsync } from 'markdown-it-async'
import { mergeConfig, resolveSiteData, type UserConfig } from 'node/config'

describe('node/config', () => {
  test('renders inline markdown in default theme text fields', async () => {
    const site = await resolveSiteData(process.cwd(), {
      themeConfig: {
        nav: [
          { text: 'Vue `<script setup>`', link: '/guide' },
          {
            text: '**Reference**',
            items: [
              { text: 'API `<T>`', link: '/api' },
              {
                text: 'Nested `<Menu>`',
                items: [{ text: '`Child`', link: '/child' }]
              }
            ]
          }
        ],
        sidebar: [
          {
            text: 'Guide `<script setup>`',
            docFooterText: 'Footer `<Foo>`',
            items: [
              { text: '**Intro**', link: '/intro' },
              { text: '<code>Raw HTML</code>', link: '/html' }
            ]
          }
        ],
        docFooter: {
          prev: 'Previous `<Page>`',
          next: false
        }
      }
    })

    expect(site.themeConfig.nav[0].text).toBe(
      'Vue <code>&lt;script setup&gt;</code>'
    )
    expect(site.themeConfig.nav[1].text).toBe('<strong>Reference</strong>')
    expect(site.themeConfig.nav[1].items[0].text).toBe(
      'API <code>&lt;T&gt;</code>'
    )
    expect(site.themeConfig.nav[1].items[1].text).toBe(
      'Nested <code>&lt;Menu&gt;</code>'
    )
    expect(site.themeConfig.nav[1].items[1].items[0].text).toBe(
      '<code>Child</code>'
    )
    expect(site.themeConfig.sidebar[0].text).toBe(
      'Guide <code>&lt;script setup&gt;</code>'
    )
    expect(site.themeConfig.sidebar[0].docFooterText).toBe(
      'Footer <code>&lt;Foo&gt;</code>'
    )
    expect(site.themeConfig.sidebar[0].items[0].text).toBe(
      '<strong>Intro</strong>'
    )
    expect(site.themeConfig.sidebar[0].items[1].text).toBe(
      '<code>Raw HTML</code>'
    )
    expect(site.themeConfig.docFooter.prev).toBe(
      'Previous <code>&lt;Page&gt;</code>'
    )
    expect(site.themeConfig.docFooter.next).toBe(false)
  })

  test('renders inline markdown in locale and additional default theme configs', async () => {
    const site = await resolveSiteData(process.cwd(), {
      locales: {
        zh: {
          label: 'Chinese',
          themeConfig: {
            sidebar: [{ text: 'Locale `<script setup>`' }]
          }
        }
      },
      additionalConfig: {
        '/guide/': {
          themeConfig: {
            nav: [{ text: 'Guide `<Item>`', link: '/guide/' }]
          }
        }
      }
    })

    expect(site.locales.zh.themeConfig?.sidebar?.[0].text).toBe(
      'Locale <code>&lt;script setup&gt;</code>'
    )
    expect(
      typeof site.additionalConfig !== 'function' &&
        site.additionalConfig?.['/guide/'].themeConfig?.nav?.[0].text
    ).toBe('Guide <code>&lt;Item&gt;</code>')
  })

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
})
