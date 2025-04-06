import { defineConfig } from 'vitepress'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
  localIconLoader
} from 'vitepress-plugin-group-icons'

let buildConcurrency: number
try {
  const { cpus } = await import('os')
  buildConcurrency = 4 * cpus().length
} catch {
  // edge services may not expose os module
  buildConcurrency = 16
}

export default defineConfig({
  title: 'VitePress',

  rewrites: {
    'en/:rest*': ':rest*'
  },

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,
  buildConcurrency,

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

  /* prettier-ignore */
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/vitepress-logo-mini.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/vitepress-logo-mini.png' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'VitePress | Vite & Vue Powered Static Site Generator' }],
    ['meta', { property: 'og:site_name', content: 'VitePress' }],
    ['meta', { property: 'og:image', content: 'https://vitepress.dev/vitepress-og.jpg' }],
    ['meta', { property: 'og:url', content: 'https://vitepress.dev/' }],
    ['script', { src: 'https://cdn.usefathom.com/script.js', 'data-site': 'AZBRSFGG', 'data-spa': 'auto', defer: '' }]
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
    },

    carbonAds: { code: 'CEBDT27Y', placement: 'vuejsorg' }
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
      })
    ]
  }
})
