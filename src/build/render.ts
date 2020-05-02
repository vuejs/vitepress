import path from 'path'
import { promises as fs } from 'fs'
import { SiteConfig, HeadConfig } from '../config'
import { BuildResult } from 'vite'
import { renderToString } from '@vue/server-renderer'
import { OutputChunk } from 'rollup'

const escape = require('escape-html')

export async function renderPage(
  config: SiteConfig,
  page: string, // foo.md
  result: BuildResult
) {
  const { createApp } = require(path.join(config.tempDir, '_assets/index.js'))
  const { app, router } = createApp()
  const routePath = `/${page.replace(/\.md$/, '')}`
  router.go(routePath)
  const content = await renderToString(app)

  const pageJsFileName = page.replace(/\//g, '_') + '.js'

  // resolve page data so we can render head tags
  const { __pageData } = require(path.join(
    config.tempDir,
    '_assets',
    pageJsFileName
  ))
  const pageData = JSON.parse(__pageData)

  const assetPath = `${config.site.base}_assets`
  const renderScript = (file: string) => {
    return `<script type="module" async src="${assetPath}/${file}"></script>`
  }

  // resolve imports for index.js + page.md.js and inject script tags for
  // them as well so we fetch everything as early as possible without having
  // to wait for entry chunks to parse
  const pageImports = resolvePageImports(config, page, result)
  const pageImportScripts = pageImports.length
    ? pageImports.map((i) => renderScript(i)).join('\n') + `\n    `
    : ``

  const html = `
<html lang="en-US">
  <head>
    <title>${pageData.title ? pageData.title + ` | ` : ``}${
    config.site.title
  }</title>
    <meta name="description" content="${config.site.description}">
    <link rel="stylesheet" href="${assetPath}/style.css">${renderHead(
    config.site.head
  )}${renderHead(pageData.frontmatter.head)}
  </head>
  <body>
    <div id="app">${content}</div>
    ${pageImportScripts}${renderScript(pageJsFileName)}
    ${renderScript(`index.js`)}
  </body>
</html>`.trim()
  const htmlFileName = path.join(config.outDir, page.replace(/\.md$/, '.html'))
  await fs.mkdir(path.dirname(htmlFileName), { recursive: true })
  await fs.writeFile(htmlFileName, html)
}

function resolvePageImports(
  config: SiteConfig,
  page: string,
  result: BuildResult
) {
  // find the page's js chunk and inject script tags for its imports so that
  // they are start fetching as early as possible
  const indexChunk = result.js.find(
    (chunk) => chunk.type === 'chunk' && chunk.fileName === `_assets/index.js`
  ) as OutputChunk
  const srcPath = path.join(config.root, page)
  const pageChunk = result.js.find(
    (chunk) => chunk.type === 'chunk' && chunk.facadeModuleId === srcPath
  ) as OutputChunk
  return Array.from(new Set([...indexChunk.imports, ...pageChunk.imports]))
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
