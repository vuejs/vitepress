import escape from 'escape-html'
import fs from 'fs-extra'
import path from 'path'
import type { OutputAsset, OutputChunk, RollupOutput } from 'rollup'
import { pathToFileURL } from 'url'
import { normalizePath, transformWithEsbuild } from 'vite'
import type { SiteConfig } from '../config'
import {
  createTitle,
  EXTERNAL_URL_RE,
  mergeHead,
  notFoundPageData,
  resolveSiteDataByRoute,
  sanitizeFileName,
  slash,
  type HeadConfig,
  type PageData,
  type SSGContext
} from '../shared'
import { deserializeFunctions } from '../utils/fnSerialize'

export async function renderPage(
  render: (path: string) => Promise<SSGContext>,
  config: SiteConfig,
  page: string, // foo.md
  result: RollupOutput | null,
  appChunk: OutputChunk | undefined,
  cssChunk: OutputAsset | undefined,
  assets: string[],
  pageToHashMap: Record<string, string>,
  hashMapString: string,
  siteDataString: string,
  additionalHeadTags: HeadConfig[]
) {
  const routePath = `/${page.replace(/\.md$/, '')}`
  const siteData = resolveSiteDataByRoute(config.site, routePath)

  // render page
  const context = await render(routePath)
  const { content, teleports } = (await config.postRender?.(context)) ?? context

  const pageName = sanitizeFileName(page.replace(/\//g, '_'))
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

  const title: string = createTitle(siteData, pageData)
  const description: string = pageData.description || siteData.description
  const stylesheetLink = cssChunk
    ? `<link rel="preload stylesheet" href="${siteData.base}${cssChunk.fileName}" as="style">`
    : ''

  let preloadLinks =
    config.mpa || (!hasCustom404 && page === '404.md')
      ? []
      : result && appChunk
      ? [
          ...new Set([
            // resolve imports for index.js + page.md.js and inject script tags
            // for them as well so we fetch everything as early as possible
            // without having to wait for entry chunks to parse
            ...resolvePageImports(config, page, result, appChunk),
            pageClientJsFileName
          ])
        ]
      : []

  let prefetchLinks: string[] = []

  const { shouldPreload } = config
  if (shouldPreload) {
    prefetchLinks = preloadLinks.filter((link) => !shouldPreload(link, page))
    preloadLinks = preloadLinks.filter((link) => shouldPreload(link, page))
  }

  const toHeadTags = (files: string[], rel: string): HeadConfig[] =>
    files.map((file) => [
      'link',
      {
        rel,
        // don't add base to external urls
        href: (EXTERNAL_URL_RE.test(file) ? '' : siteData.base) + file
      }
    ])

  const preloadHeadTags = toHeadTags(preloadLinks, 'modulepreload')
  const prefetchHeadTags = toHeadTags(prefetchLinks, 'prefetch')

  const headBeforeTransform = [
    ...additionalHeadTags,
    ...preloadHeadTags,
    ...prefetchHeadTags,
    ...mergeHead(
      siteData.head,
      filterOutHeadDescription(pageData.frontmatter.head)
    )
  ]

  const head = mergeHead(
    headBeforeTransform,
    (await config.transformHead?.({
      page,
      siteConfig: config,
      siteData,
      pageData,
      title,
      description,
      head: headBeforeTransform,
      content,
      assets
    })) || []
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

  let metadataScript = `__VP_HASH_MAP__ = JSON.parse(${hashMapString})\n`
  if (siteDataString.includes('_vp-fn_')) {
    metadataScript += `${deserializeFunctions.toString()}\n__VP_SITE_DATA__ = deserializeFunctions(JSON.parse(${siteDataString}))`
  } else {
    metadataScript += `__VP_SITE_DATA__ = JSON.parse(${siteDataString})`
  }

  const html = `
<!DOCTYPE html>
<html lang="${siteData.lang}" dir="${siteData.dir}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    ${stylesheetLink}
    ${
      appChunk
        ? `<script type="module" src="${siteData.base}${appChunk.fileName}"></script>`
        : ``
    }
    ${await renderHead(head)}
  </head>
  <body>${teleports?.body || ''}
    <div id="app">${content}</div>
    ${config.mpa ? '' : `<script>${metadataScript}</script>`}
    ${inlinedScript}
  </body>
</html>`.trim()
  const htmlFileName = path.join(config.outDir, page.replace(/\.md$/, '.html'))

  await fs.ensureDir(path.dirname(htmlFileName))
  const transformedHtml = await config.transformHtml?.(html, htmlFileName, {
    page,
    siteConfig: config,
    siteData,
    pageData,
    title,
    description,
    head,
    content,
    assets
  })
  await fs.writeFile(htmlFileName, transformedHtml || html)
}

function resolvePageImports(
  config: SiteConfig,
  page: string,
  result: RollupOutput,
  appChunk: OutputChunk
) {
  page = config.rewrites.inv[page] || page
  // find the page's js chunk and inject script tags for its imports so that
  // they start fetching as early as possible
  let srcPath = path.resolve(config.srcDir, page)
  try {
    srcPath = fs.realpathSync(srcPath)
  } catch (e) {
    // if the page is a virtual page generated by a dynamic route this would
    // fail, which is expected
  }
  srcPath = normalizePath(srcPath)
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
