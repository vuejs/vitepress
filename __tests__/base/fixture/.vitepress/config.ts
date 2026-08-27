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
  themeConfig: {
    nav: [{ text: 'Guide', link: '/sub/page' }],
    sidebar: [
      { text: 'Sub', link: '/sub/page' },
      { text: 'Deep', link: '/sub/deep/page2' },
      { text: 'Moved', link: '/moved/target' }
    ],
    ...(mode === 'mpa' ? {} : { search: { provider: 'local' } })
  }
})
