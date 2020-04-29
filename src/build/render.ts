import path from 'path'
import { SiteConfig } from '../config'
import { BuildResult } from 'vite'
import { renderToString } from '@vue/server-renderer'

export async function renderPage(
  config: SiteConfig,
  page: string, // foo.md
  result: BuildResult[]
) {
  const { createApp } = require(path.join(config.tempDir, 'js/index.js'))
  const { app, router } = createApp()
  const routePath = `/${page.replace(/\.md$/, '')}`
  router.go(routePath)
  const html = await renderToString(app)
  console.log(html)
}
