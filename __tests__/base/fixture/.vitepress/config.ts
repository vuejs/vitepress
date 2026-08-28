import { defineConfig } from 'vitepress'

const mode = process.env.VP_TEST_MODE || 'relative'

export default defineConfig({
  title: 'Base Fixture',
  description: 'Fixture site for base/assetsBase behavior',
  base: mode === 'plain' || mode === 'cdn' ? '/' : './',
  assetsBase:
    mode === 'cdn' ? `http://localhost:${process.env.VP_CDN_PORT}/` : undefined,
  mpa: mode === 'mpa',
  outDir: `.vitepress/dist-${mode}`,
  cleanUrls: false,
  rewrites: { 'src-moved.md': 'moved/target.md' },
  vite: {
    logLevel: 'error',
    // keep the tiny fixture images as real emitted assets
    build: { assetsInlineLimit: 0 }
  },
  // user hooks must only ever see final urls, never the build sentinel
  postRender(context) {
    if (JSON.stringify(context.teleports ?? {}).includes('__VP_BASE__')) {
      throw new Error('sentinel leaked to postRender teleports')
    }
    if (context.content.includes('__VP_BASE__')) {
      throw new Error('sentinel leaked to postRender')
    }
  },
  transformHead({ assets, head, content }) {
    if ((JSON.stringify([assets, head]) + content).includes('__VP_BASE__')) {
      throw new Error('sentinel leaked to transformHead')
    }
  },
  transformHtml(code, _id, { assets, content }) {
    if ((code + JSON.stringify(assets) + content).includes('__VP_BASE__')) {
      throw new Error('sentinel leaked to transformHtml')
    }
  },
  themeConfig: {
    nav: [{ text: 'Guide', link: '/sub/page' }],
    socialLinks: [{ icon: 'github', link: 'https://github.com' }],
    sidebar: [
      { text: 'Sub', link: '/sub/page' },
      { text: 'Deep', link: '/sub/deep/page2' },
      { text: 'Moved', link: '/moved/target' }
    ],
    ...(mode === 'mpa' ? {} : { search: { provider: 'local' } })
  }
})
