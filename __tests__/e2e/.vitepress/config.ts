import path from 'node:path'
import { defineConfig, type DefaultTheme } from 'vitepress'

let renderCapturedMarkdown: (() => Promise<string>) | undefined
const batchHeadHookPages = new Set<string>()
let batchHeadHookSequence = 0

const nav: DefaultTheme.Config['nav'] = [
  {
    text: 'Home',
    link: '/'
  },
  {
    text: 'API Reference',
    items: [
      {
        text: 'Example',
        link: '/home.html'
      },
      {
        component: 'ApiPreference',
        props: {
          options: ['JavaScript', 'TypeScript', 'Flow'],
          defaultOption: 'TypeScript'
        }
      },
      {
        component: 'ApiPreference',
        props: {
          options: ['Options', 'Composition'],
          defaultOption: 'Composition'
        }
      }
    ]
  },
  {
    component: 'NavVersion',
    props: {
      versions: [
        {
          text: 'v1.x',
          link: '/'
        },
        {
          text: 'v0.x',
          link: '/v0.x/'
        }
      ]
    }
  },
  {
    text: 'Nested',
    items: [
      {
        text: 'Level 1 - 1',
        items: [
          {
            text: 'Level 2 - 1',
            link: '/nested/level1-1/level2-1'
          }
        ]
      },
      {
        text: 'Level 1 - 2',
        items: [
          {
            text: 'Level 2 - 2',
            link: '/nested/level1-2/level2-2'
          }
        ]
      }
    ]
  }
]

const sidebar: DefaultTheme.Config['sidebar'] = {
  '/': [
    {
      text: 'Frontmatter',
      collapsed: false,
      items: [
        {
          text: 'Multiple Levels Outline',
          link: '/frontmatter/multiple-levels-outline'
        }
      ]
    },
    {
      text: '& &#60;Text Literals &> <code>code</code>',
      items: [
        {
          text: '& &#60;Test Page &> <code>code</code>',
          link: '/text-literals/'
        }
      ]
    },
    {
      text: 'Data Loading',
      items: [
        {
          text: 'Test Page',
          link: '/data-loading/data'
        }
      ]
    },
    {
      text: 'Multi Sidebar Test',
      items: [
        {
          text: 'Test Page',
          link: '/multi-sidebar/'
        }
      ]
    },
    {
      text: 'Dynamic Routes',
      items: [
        {
          text: 'Foo',
          link: '/dynamic-routes/foo'
        },
        {
          text: 'Bar',
          link: '/dynamic-routes/bar'
        }
      ]
    },
    {
      text: 'Markdown Extensions',
      items: [
        {
          text: 'Test Page',
          link: '/markdown-extensions/'
        },
        {
          text: 'Foo',
          link: '/markdown-extensions/foo'
        }
      ]
    }
  ],
  '/multi-sidebar/': [
    {
      text: 'Multi Sidebar',
      items: [
        {
          text: 'Test Page',
          link: '/multi-sidebar/'
        },
        {
          text: 'Back',
          link: '/'
        }
      ]
    }
  ]
}

export default defineConfig({
  title: 'Example',
  description: 'An example app using VitePress.',
  ssrBuildBatchSize: process.env.VITE_TEST_SSR_BATCH ? 10 : undefined,
  ssrBuildWorkerConcurrency: process.env.VITE_TEST_SSR_BATCH ? 2 : undefined,
  markdown: {
    shikiCacheKey: 'user-configured-shiki-cache-key',
    image: { lazyLoad: true },
    config(md) {
      renderCapturedMarkdown = () =>
        md.renderAsync('```ts\nconst batch = true\n```')
    }
  },
  themeConfig: {
    nav,
    sidebar,
    socialLinks: [
      {
        icon: 'github',
        link: '/home',
        ariaLabel: 'Home social link',
        target: '_self'
      }
    ],
    search: {
      provider: 'local',
      options: {
        async _render(src, env, md) {
          const html = await md.renderAsync(src, env)
          if (env.frontmatter?.search === false) return ''
          if (env.relativePath.startsWith('local-search/excluded')) return ''
          return html
        }
      }
    }
  },
  vite: {
    build: {
      // Test the batching guard. It prevents SSR workers from copying the
      // public directory into temporary output.
      copyPublicDir: true
    },
    plugins: [
      {
        name: 'test:ssr-batch-public-copy',
        config() {
          if (process.env.VITE_TEST_SSR_BATCH) {
            return {
              publicDir: 'batch-public',
              resolve: {
                alias: {
                  '/vitepress.png': path.resolve(
                    import.meta.dirname,
                    '../public/vitepress.png'
                  )
                }
              },
              environments: {
                ssr: { build: { copyPublicDir: true } }
              }
            }
          }
        },
        configResolved(config) {
          if (
            process.env.VITE_TEST_SSR_BATCH &&
            config.build.ssr &&
            (config.build.copyPublicDir !== false ||
              config.environments.ssr?.build.copyPublicDir !== false)
          ) {
            throw new Error('SSR batch worker would copy the public directory')
          }
        }
      }
    ],
    server: {
      watch: {
        usePolling: true,
        interval: 100
      }
    }
  },
  buildEnd(siteConfig) {
    if (
      process.env.VITE_TEST_SSR_BATCH &&
      siteConfig.publicDir !== path.resolve(siteConfig.srcDir, 'batch-public')
    ) {
      throw new Error('Resolved publicDir was not restored in the coordinator')
    }
    if (
      process.env.VITE_TEST_SSR_BATCH &&
      (!batchHeadHookPages.has('ssr-static.md') ||
        !batchHeadHookPages.has('dynamic-routes/foo.md'))
    ) {
      throw new Error(
        'Coordinator-owned build hook state was not preserved across SSR workers'
      )
    }
  },
  transformHead(context) {
    if (!process.env.VITE_TEST_SSR_BATCH) return
    if (
      context.siteConfig.markdown?.shikiCacheKey !==
      'user-configured-shiki-cache-key'
    ) {
      throw new Error(
        'SSR batching exposed its internal Shiki cache key to render hooks'
      )
    }

    batchHeadHookPages.add(context.page)
    return [
      [
        'meta',
        {
          name: 'ssr-batch-hook-state',
          content: `${++batchHeadHookSequence}:${context.pageData.relativePath}`
        }
      ]
    ]
  },
  transformHtml(code, _id, context) {
    if (!process.env.VITE_TEST_SSR_BATCH) return
    if (!batchHeadHookPages.has(context.page)) {
      throw new Error(
        'transformHtml ran without coordinator transformHead state'
      )
    }

    return code.replace(
      '</body>',
      `<span hidden data-ssr-batch-transform="${context.page}"></span>\n  </body>`
    )
  },
  async postRender(context) {
    if (process.env.VITE_TEST_SSR_BATCH) {
      if (!renderCapturedMarkdown) {
        throw new Error('Markdown renderer was not captured during SSR setup')
      }
      await renderCapturedMarkdown()
    }
    return context
  }
})
