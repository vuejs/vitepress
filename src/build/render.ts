import path from 'path'
import { promises as fs } from 'fs'
import { SiteConfig, HeadConfig } from '../config'
import { BuildResult } from 'vite'
import { renderToString } from '@vue/server-renderer'

const escape = require('escape-html')

export async function renderPage(
  config: SiteConfig,
  page: string, // foo.md
  result: BuildResult[]
) {
  const { createApp } = require(path.join(config.tempDir, '_assets/index.js'))
  const { app, router } = createApp()
  const routePath = `/${page.replace(/\.md$/, '')}`
  router.go(routePath)
  const content = await renderToString(app)

  const assetPath = `${config.site.base}_assets`
  const pageJsPath = page.replace(/\//g, '_') + '.js'
  const { __pageData } = require(path.join(
    config.tempDir,
    '_assets',
    pageJsPath
  ))

  const html = `
<html lang="en-US">
  <head>
    <title>${__pageData.title ? __pageData.title + ` | ` : ``}${
    config.site.title
  }</title>
    <meta name="description" content="${config.site.description}">
    <link rel="stylesheet" href="${assetPath}/style.css">${renderHead(
    config.site.head
  )}${renderHead(__pageData.frontmatter.head)}
  </head>
  <body>
    <div id="app">${content}</div>
    <script type="module" src="${assetPath}/${pageJsPath}"></script>
    <script type="module" src="${assetPath}/index.js"></script>
  </body>
</html>`.trim()
  const htmlFileName = path.join(config.outDir, page.replace(/\.md$/, '.html'))
  await fs.mkdir(path.dirname(htmlFileName), { recursive: true })
  await fs.writeFile(htmlFileName, html)
}

function renderHead(head: HeadConfig[]) {
  if (!head || !head.length) {
    return ''
  }
  return (
    `\n    ` +
    head
      .map(([tag, attrs = {}, innerHTML = '']) => {
        const openTag = `<${tag}${renderAttrs(attrs)}>`
        if (tag !== 'link' && tag !== 'meta') {
          return `${openTag}${innerHTML}</${tag}>`
        } else {
          return openTag
        }
      })
      .join('\n    ')
  )
}

function renderAttrs(attrs: Record<string, string>): string {
  return Object.keys(attrs)
    .map((key) => {
      return ` ${key}="${escape(attrs[key])}"`
    })
    .join('')
}
