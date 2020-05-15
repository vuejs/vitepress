import path from 'path'
import fs from 'fs-extra'
import { SiteConfig, HeadConfig } from '../config'
import { BuildResult } from 'vite'
import { renderToString } from '@vue/server-renderer'
import { OutputChunk } from 'rollup'
import { ASSETS_DIR } from './build'

const escape = require('escape-html')

export async function renderPage(
  config: SiteConfig,
  page: string, // foo.md
  result: BuildResult
) {
  const { createApp } = require(path.join(
    config.tempDir,
    ASSETS_DIR,
    'index.js'
  ))
  const { app, router } = createApp()
  const routePath = `/${page.replace(/\.md$/, '')}`
  router.go(routePath)
  const content = await renderToString(app)

  const pageJsFileName = page.replace(/\//g, '_') + '.js'

  // resolve page data so we can render head tags
  const { __pageData } = require(path.join(
    config.tempDir,
    ASSETS_DIR,
    pageJsFileName
  ))
  const pageData = JSON.parse(__pageData)

  const assetPath = `${config.site.base}${ASSETS_DIR}`

  const preloadLinks = [
    // resolve imports for index.js + page.md.js and inject script tags for
    // them as well so we fetch everything as early as possible without having
    // to wait for entry chunks to parse
    ...resolvePageImports(config, page, result),
    pageJsFileName,
    'index.js'
  ]
    .map((file) => {
      return `<link rel="modulepreload" href="${assetPath}${file}">`
    })
    .join('\n    ')

  const html = `
<html lang="en-US">
  <head>
    <title>${pageData.title ? pageData.title + ` | ` : ``}${
    config.site.title
  }</title>
    <meta name="description" content="${config.site.description}">
    <link rel="stylesheet" href="${assetPath}style.css">
    ${preloadLinks}
    ${renderHead(config.site.head)}
    ${renderHead(pageData.frontmatter.head)}
  </head>
  <body>
    <div id="app">${content}</div>
    <script type="module" async src="${assetPath}index.js"></script>
  </body>
</html>`.trim()
  const htmlFileName = path.join(config.outDir, page.replace(/\.md$/, '.html'))
  await fs.ensureDir(path.dirname(htmlFileName))
  await fs.writeFile(htmlFileName, html)
}

function resolvePageImports(
  config: SiteConfig,
  page: string,
  result: BuildResult
) {
  // find the page's js chunk and inject script tags for its imports so that
  // they are start fetching as early as possible
  const indexChunk = result.assets.find(
    (chunk) => chunk.type === 'chunk' && chunk.fileName === `index.js`
  ) as OutputChunk
  const srcPath = path.join(config.root, page)
  const pageChunk = result.assets.find(
    (chunk) => chunk.type === 'chunk' && chunk.facadeModuleId === srcPath
  ) as OutputChunk
  return Array.from(new Set([...indexChunk.imports, ...pageChunk.imports]))
}

function renderHead(head: HeadConfig[]) {
  if (!head || !head.length) {
    return ''
  }
  return head
    .map(([tag, attrs = {}, innerHTML = '']) => {
      const openTag = `<${tag}${renderAttrs(attrs)}>`
      if (tag !== 'link' && tag !== 'meta') {
        return `${openTag}${innerHTML}</${tag}>`
      } else {
        return openTag
      }
    })
    .join('\n    ')
}

function renderAttrs(attrs: Record<string, string>): string {
  return Object.keys(attrs)
    .map((key) => {
      return ` ${key}="${escape(attrs[key])}"`
    })
    .join('')
}
