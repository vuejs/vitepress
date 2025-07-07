import * as cheerio from 'cheerio'
import fs from 'node:fs'
import path from 'node:path'
import {
  defineConfig,
  resolveSiteDataByRoute,
  type HeadConfig
} from 'vitepress'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
  localIconLoader
} from 'vitepress-plugin-group-icons'
import llmstxt from 'vitepress-plugin-llms'

const prod = !!process.env.NETLIFY

const headers: [string, string][] = [
  ['/assets/*', 'Cache-Control: max-age=31536000, immutable'],
  ['/_translations/*', 'X-Robots-Tag: noindex']
]

export default defineConfig({
  title: 'VitePress',

  rewrites: {
    'en/:rest*': ':rest*'
  },

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  markdown: {
    math: true,
    codeTransformers: [
      // We use `[!!code` in demo to prevent transformation, here we revert it back.
      {
        postprocess(code) {
          return code.replace(/\[\!\!code/g, '[!code')
        }
      }
    ],
    config(md) {
      // TODO: remove when https://github.com/vuejs/vitepress/issues/4431 is fixed
      const fence = md.renderer.rules.fence!
      md.renderer.rules.fence = function (tokens, idx, options, env, self) {
        const { localeIndex = 'root' } = env
        const codeCopyButtonTitle = (() => {
          switch (localeIndex) {
            case 'es':
              return 'Copiar código'
            case 'fa':
              return 'کپی کد'
            case 'ko':
              return '코드 복사'
            case 'pt':
              return 'Copiar código'
            case 'ru':
              return 'Скопировать код'
            case 'zh':
              return '复制代码'
            default:
              return 'Copy code'
          }
        })()
        return fence(tokens, idx, options, env, self).replace(
          '<button title="Copy Code" class="copy"></button>',
          `<button title="${codeCopyButtonTitle}" class="copy"></button>`
        )
      }
      md.use(groupIconMdPlugin)
    }
  },

  sitemap: {
    hostname: 'https://vitepress.dev',
    transformItems(items) {
      return items.filter((item) => !item.url.includes('migration'))
    }
  },

  head: [
    [
      'link',
      { rel: 'icon', type: 'image/svg+xml', href: '/vitepress-logo-mini.svg' }
    ],
    [
      'link',
      { rel: 'icon', type: 'image/png', href: '/vitepress-logo-mini.png' }
    ],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'VitePress' }],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://vitepress.dev/vitepress-og.jpg'
      }
    ],
    ['meta', { property: 'og:url', content: 'https://vitepress.dev/' }],
    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'AZBRSFGG',
        'data-spa': 'auto',
        defer: ''
      }
    ]
  ],

  themeConfig: {
    logo: { src: '/vitepress-logo-mini.svg', width: 24, height: 24 },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    search: {
      provider: 'algolia',
      options: {
        appId: '8J64VVRP8K',
        apiKey: '52f578a92b88ad6abde815aae2b0ad7c',
        indexName: 'vitepress'
      }
    }

    // carbonAds: { code: 'CEBDT27Y', placement: 'vuejsorg' } // TODO: temporarily disabled
  },

  locales: {
    root: { label: 'English' },
    zh: { label: '简体中文' },
    pt: { label: 'Português' },
    ru: { label: 'Русский' },
    es: { label: 'Español' },
    ko: { label: '한국어' },
    fa: { label: 'فارسی' }
  },

  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          vitepress: localIconLoader(
            import.meta.url,
            '../public/vitepress-logo-mini.svg'
          ),
          firebase: 'logos:firebase'
        }
      }),
      prod &&
        llmstxt({
          workDir: 'en',
          ignoreFiles: ['index.md']
        })
    ],
    experimental: {
      enableNativePlugin: true
    }
  },

  transformPageData: prod
    ? (pageData, ctx) => {
        const site = resolveSiteDataByRoute(
          ctx.siteConfig.site,
          pageData.relativePath
        )
        const title = `${pageData.title || site.title} | ${pageData.description || site.description}`
        ;((pageData.frontmatter.head ??= []) as HeadConfig[]).push(
          ['meta', { property: 'og:locale', content: site.lang }],
          ['meta', { property: 'og:title', content: title }]
        )
      }
    : undefined,

  // TODO: add only on prod
  transformHtml: (code, id, ctx) => {
    if (id.endsWith('/404.html')) return

    // TODO: provide this as manifest

    const $ = cheerio.load(code)
    const m = $.extract({
      links: [
        {
          selector: 'link:is([rel*=preload],[rel*=preconnect])',
          value: (el) => el.attribs
        }
      ],
      scripts: [
        {
          selector: 'script[type=module]',
          value: (el) => {
            const src = el.attribs.src
            if (src && !src.startsWith('http')) {
              return { href: src, rel: 'modulepreload' }
            }
            return null
          }
        }
      ]
    })
    const toPreload: HeadConfig[] = [
      ...m.links,
      ...m.scripts,
      { rel: 'preload', as: 'image', href: '/vitepress-logo-mini.svg' },
      ctx.pageData.frontmatter.layout === 'home'
        ? { rel: 'preload', as: 'image', href: '/vitepress-logo-large.svg' }
        : undefined
    ]
      .filter((x) => x !== undefined)
      .map((link) => ['link', link])

    id = id
      .slice(ctx.siteConfig.outDir.length)
      .replace(/(^|\/)index(?:\.html)?$/, '$1')
    if (ctx.siteConfig.cleanUrls) {
      id = id.replace(/\.html$/, '')
    }

    headers.push([
      id,
      'Link: ' + toPreload.map((link) => toLinkHeader(link)).join(', ')
    ])

    return code.replace(/(<\w+)/g, '$1\n') // FIXME: hacky line splitting
  },

  buildEnd: (siteConfig) => {
    headers.sort(
      (a, b) =>
        b[0].length - a[0].length ||
        a[0].localeCompare(b[0]) ||
        a[1].localeCompare(b[1])
    )

    fs.mkdirSync(path.join(siteConfig.outDir, '.vite'), { recursive: true })

    fs.writeFileSync(
      path.join(siteConfig.outDir, '.vite/headers.json'),
      JSON.stringify(headers, null, 2),
      'utf-8'
    )

    fs.writeFileSync(
      path.join(siteConfig.outDir, '_headers'),
      headers.map(([id, header]) => `${id}\n\t${header}`).join('\n\n') + '\n',
      'utf-8'
    )
  }
})

function toLinkHeader([_, { href, ...attributes }]: HeadConfig): string {
  const attributeParts = [`<${encodeURI(href)}>`]

  for (const [key, value] of Object.entries(attributes)) {
    if (value === '') {
      attributeParts.push(key)
    } else {
      attributeParts.push(`${key}="${value}"`)
    }
  }

  return attributeParts.join('; ')
}
