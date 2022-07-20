import { createRequire } from 'module'
import fs from 'fs-extra'
import path from 'path'
import { pathToFileURL } from 'url'
import escape from 'escape-html'
import { normalizePath, transformWithEsbuild } from 'vite'
import { RollupOutput, OutputChunk, OutputAsset } from 'rollup'
import {
  HeadConfig,
  PageData,
  createTitle,
  notFoundPageData,
  mergeHead
} from '../shared'
import { slash } from '../utils/slash'
import { SiteConfig, resolveSiteDataByRoute } from '../config'

const require = createRequire(import.meta.url)

export async function renderPage(
  config: SiteConfig,
  page: string, // foo.md
  result: RollupOutput | null,
  appChunk: OutputChunk | undefined,
  cssChunk: OutputAsset | undefined,
  pageToHashMap: Record<string, string>,
  hashMapString: string
) {
  const { createApp } = await import(
    pathToFileURL(path.join(config.tempDir, `app.js`)).toString()
  )
  const { app, router } = createApp()
  const routePath = `/${page.replace(/\.md$/, '')}`
  const siteData = resolveSiteDataByRoute(config.site, routePath)
  router.go(routePath)

  // lazy require server-renderer for production build
  // prioritize project root over vitepress' own dep
  let rendererPath
  try {
    rendererPath = require.resolve('vue/server-renderer', {
      paths: [config.root]
    })
  } catch (e) {
    rendererPath = require.resolve('vue/server-renderer')
  }

  // render page
  const content = await import(pathToFileURL(rendererPath).toString()).then(
    (r) => r.renderToString(app)
  )

  const pageName = page.replace(/\//g, '_')
  // server build doesn't need hash
  const pageServerJsFileName = pageName + '.js'
  // for any initial page load, we only need the lean version of the page js
  // since the static content is already on the page!
  const pageHash = pageToHashMap[pageName.toLowerCase()]
  const pageClientJsFileName = `assets/${pageName}.${pageHash}.lean.js`

  let pageData: PageData
  let hasCustom404 = true

  try {
    // resolve page data so we can render head tags
    const { __pageData } = await import(
      pathToFileURL(path.join(config.tempDir, pageServerJsFileName)).toString()
    )
    pageData = __pageData
  } catch (e) {
    if (page === '404.md') {
      hasCustom404 = false
      pageData = notFoundPageData
    } else {
      throw e
    }
  }

  let preloadLinks =
    config.mpa || (!hasCustom404 && page === '404.md')
      ? appChunk
        ? [appChunk.fileName]
        : []
      : result && appChunk
      ? [
          ...new Set([
            // resolve imports for index.js + page.md.js and inject script tags
            // for them as well so we fetch everything as early as possible
            // without having to wait for entry chunks to parse
            ...resolvePageImports(config, page, result, appChunk),
            pageClientJsFileName,
            appChunk.fileName
          ])
        ]
      : []

  let prefetchLinks: string[] = []

  const { shouldPreload } = config
  if (shouldPreload) {
    prefetchLinks = preloadLinks.filter((link) => !shouldPreload(link, page))
    preloadLinks = preloadLinks.filter((link) => shouldPreload(link, page))
  }

  const preloadLinksString = preloadLinks
    .map((file) => {
      return `<link rel="modulepreload" href="${siteData.base}${file}">`
    })
    .join('\n    ')

  const prefetchLinkString = prefetchLinks
    .map((file) => {
      return `<link rel="prefetch" href="${siteData.base}${file}">`
    })
    .join('\n    ')

  const stylesheetLink = cssChunk
    ? `<link rel="stylesheet" href="${siteData.base}${cssChunk.fileName}">`
    : ''

  const title: string = createTitle(siteData, pageData)
  const description: string = pageData.description || siteData.description

  const head = mergeHead(
    siteData.head,
    filterOutHeadDescription(pageData.frontmatter.head)
  )

  let inlinedScript = ''
  if (config.mpa && result) {
    const matchingChunk = result.output.find(
      (chunk) =>
        chunk.type === 'chunk' &&
        chunk.facadeModuleId === slash(path.join(config.srcDir, page))
    ) as OutputChunk
    if (matchingChunk) {
      if (!matchingChunk.code.includes('import')) {
        inlinedScript = `<script type="module">${matchingChunk.code}</script>`
        fs.removeSync(path.resolve(config.outDir, matchingChunk.fileName))
      } else {
        inlinedScript = `<script type="module" src="${siteData.base}${matchingChunk.fileName}"></script>`
      }
    }
  }

  const html = `
<!DOCTYPE html>
<html lang="${siteData.lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    ${stylesheetLink}
    ${preloadLinksString}
    ${prefetchLinkString}
    ${await renderHead(head)}
  </head>
  <body>
    <div id="app">${content}</div>
    ${
      config.mpa
        ? ''
        : `<script>__VP_HASH_MAP__ = JSON.parse(${hashMapString})</script>`
    }
    ${
      appChunk
        ? `<script type="module" async src="${siteData.base}${appChunk.fileName}"></script>`
        : ``
    }
    ${inlinedScript}
  </body>
</html>`.trim()
  const htmlFileName = path.join(config.outDir, page.replace(/\.md$/, '.html'))
  await fs.ensureDir(path.dirname(htmlFileName))
  const transformedHtml = await config.transformHtml?.(html, htmlFileName, {
    siteConfig: config,
    siteData,
    pageData,
    title,
    description,
    head,
    content
  })
  await fs.writeFile(htmlFileName, transformedHtml || html)
}

function resolvePageImports(
  config: SiteConfig,
  page: string,
  result: RollupOutput,
  appChunk: OutputChunk
) {
  // find the page's js chunk and inject script tags for its imports so that
  // they start fetching as early as possible
  const srcPath = normalizePath(
    fs.realpathSync(path.resolve(config.srcDir, page))
  )
  const pageChunk = result.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.facadeModuleId === srcPath
  ) as OutputChunk
  return [
    ...appChunk.imports,
    ...appChunk.dynamicImports,
    ...pageChunk.imports,
    ...pageChunk.dynamicImports
  ]
}

function renderHead(head: HeadConfig[]): Promise<string> {
  return Promise.all(
    head.map(async ([tag, attrs = {}, innerHTML = '']) => {
      const openTag = `<${tag}${renderAttrs(attrs)}>`
      if (tag !== 'link' && tag !== 'meta') {
        if (
          tag === 'script' &&
          (attrs.type === undefined || attrs.type.includes('javascript'))
        ) {
          innerHTML = (
            await transformWithEsbuild(innerHTML, 'inline-script.js', {
              minify: true
            })
          ).code.trim()
        }
        return `${openTag}${innerHTML}</${tag}>`
      } else {
        return openTag
      }
    })
  ).then((tags) => tags.join('\n  '))
}

function renderAttrs(attrs: Record<string, string>): string {
  return Object.keys(attrs)
    .map((key) => {
      return ` ${key}="${escape(attrs[key])}"`
    })
    .join('')
}

function isMetaDescription(headConfig: HeadConfig) {
  const [type, attrs] = headConfig
  return type === 'meta' && attrs?.name === 'description'
}

function filterOutHeadDescription(head: HeadConfig[] | undefined) {
  return head ? head.filter((h) => !isMetaDescription(h)) : []
}
