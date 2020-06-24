import path from 'path'
import fs from 'fs-extra'
import { SiteConfig } from '../config'
import { HeadConfig } from '../../../types/shared'
import { BuildResult } from 'vite'
import { OutputChunk, OutputAsset } from 'rollup'

const escape = require('escape-html')

export async function renderPage(
  config: SiteConfig,
  page: string, // foo.md
  result: BuildResult,
  appChunk: OutputChunk,
  cssChunk: OutputAsset,
  pageToHashMap: Record<string, string>,
  hashMapStirng: string
) {
  const { createApp } = require(path.join(config.tempDir, 'app.js'))
  const { app, router } = createApp()
  const routePath = `/${page.replace(/\.md$/, '')}`
  router.go(routePath)
  // lazy require server-renderer for production build
  const content = await require('@vue/server-renderer').renderToString(app)

  const pageName = page.replace(/\//g, '_')
  // server build doesn't need hash
  const pageServerJsFileName = pageName + '.js'
  // for any initial page load, we only need the lean version of the page js
  // since the static content is already on the page!
  const pageHash = pageToHashMap[pageName]
  const pageClientJsFileName = pageName + `.` + pageHash + '.lean.js'

  // resolve page data so we can render head tags
  const { __pageData } = require(path.join(
    config.tempDir,
    pageServerJsFileName
  ))
  const pageData = JSON.parse(__pageData)

  const assetPath = `${config.site.base}_assets/`
  const preloadLinks = [
    // resolve imports for index.js + page.md.js and inject script tags for
    // them as well so we fetch everything as early as possible without having
    // to wait for entry chunks to parse
    ...resolvePageImports(config, page, result, appChunk),
    pageClientJsFileName,
    appChunk.fileName
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
    <link rel="stylesheet" href="${assetPath}${cssChunk.fileName}">
    ${preloadLinks}
    ${renderHead(config.site.head)}
    ${renderHead(pageData.frontmatter.head)}
  </head>
  <body>
    <div id="app">${content}</div>
    <script>__VP_HASH_MAP__ = JSON.parse(${hashMapStirng})</script>
    <script type="module" async src="${assetPath}${appChunk.fileName}"></script>
  </body>
</html>`.trim()
  const htmlFileName = path.join(config.outDir, page.replace(/\.md$/, '.html'))
  await fs.ensureDir(path.dirname(htmlFileName))
  await fs.writeFile(htmlFileName, html)
}

function resolvePageImports(
  config: SiteConfig,
  page: string,
  result: BuildResult,
  indexChunk: OutputChunk
) {
  // find the page's js chunk and inject script tags for its imports so that
  // they are start fetching as early as possible

  const srcPath = path.resolve(config.root, page)
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
