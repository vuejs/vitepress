import { mkdir, realpath, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { isBooleanAttr } from '@vue/shared'
import { minify, normalizePath, type Rolldown } from 'vite'

import { version } from '../../../package.json' with { type: 'json' }
import type { SiteConfig } from '../config'
import { VP_ICONS_HASH_PLACEHOLDER, vpIconsFileName } from '../icons'
import {
  EXTERNAL_URL_RE,
  RELATIVE_BASE_SENTINEL,
  createTitle,
  escapeHtml,
  isRelativeBase,
  mergeHead,
  notFoundPageData,
  relativePathToRoot,
  resolveSiteDataByRoute,
  sanitizeFileName,
  slash,
  type HeadConfig,
  type PageData,
  type SSGContext
} from '../shared'
import { nativeImport } from '../utils/nativeImport'

export async function renderPage(
  render: (path: string) => Promise<SSGContext>,
  config: SiteConfig,
  page: string, // foo.md
  result: Rolldown.RolldownOutput | null | undefined,
  appChunk: Rolldown.OutputChunk | null | undefined,
  cssChunk: Rolldown.OutputAsset | null | undefined,
  assets: string[],
  pageToHashMap: Record<string, string>,
  metadataScript: { html: string; inHead: boolean },
  additionalHeadTags: HeadConfig[],
  usedIcons: Set<string>
) {
  const routePath = `/${page.replace(/\.md$/, '')}`
  const relativeBase = isRelativeBase(config.site.base)
  const pageBase = relativeBase ? relativePathToRoot(page) : config.site.base

  // user hooks must never see the build sentinel
  const desentinel = (value: string) =>
    relativeBase ? value.replaceAll(RELATIVE_BASE_SENTINEL, pageBase) : value

  const context = await render(routePath)
  if (relativeBase) {
    context.content = desentinel(context.content)
    if (context.teleports) {
      for (const key in context.teleports) {
        context.teleports[key] = desentinel(context.teleports[key])
      }
    }
  }

  // collect the icons rendered during SSR; postRender may replace the
  // context and contribute more
  context.vpIcons?.forEach((icon) => usedIcons.add(icon))

  const rendered = (await config.postRender?.(context)) ?? context
  const { content, teleports } = rendered
  if (rendered !== context) {
    rendered.vpIcons?.forEach((icon: string) => usedIcons.add(icon))
  }

  const pageName = sanitizeFileName(page.replace(/\//g, '_'))
  // server build doesn't need hash
  const pageServerJsFileName = pageName + '.js'

  let pageData: PageData
  let hasCustom404 = true

  try {
    // resolve page data so we can render head tags
    const { __pageData } = await nativeImport(
      path.join(config.tempDir, pageServerJsFileName)
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

  const siteData = resolveSiteDataByRoute(config.site, page, pageData.filePath)

  const assetUrl = (file: string) => (config.assetsBase ?? pageBase) + file
  const assetsCrossOrigin =
    config.assetsBase && EXTERNAL_URL_RE.test(config.assetsBase)
      ? ' crossorigin'
      : ''
  const pageAssets = relativeBase ? assets.map(desentinel) : assets

  const title = createTitle(siteData, pageData)
  const description = pageData.description || siteData.description
  const dir = pageData.frontmatter.dir || siteData.dir || 'ltr'
  const isDefault404 = page === '404.md' && !hasCustom404

  // the initial load only needs the lean page js — the static content is
  // already in the HTML
  const pageHash = pageToHashMap[pageName.toLowerCase()]
  const pageClientJsFileName = `${config.assetsDir}/${pageName}.${pageHash}.lean.js`

  let preloadLinks: string[] = []
  if (result && appChunk && !config.mpa && !isDefault404) {
    preloadLinks = [
      ...new Set([
        // the imports of index.js + page.md.js as well, so everything
        // fetches without waiting for the entry chunks to parse
        ...(await resolvePageImports(config, page, result, appChunk)),
        pageClientJsFileName
      ])
    ]
  }

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
        href: EXTERNAL_URL_RE.test(file) ? file : assetUrl(file),
        // must match the cors mode of the later module fetch, or the
        // cached response is not reused
        ...(assetsCrossOrigin && !EXTERNAL_URL_RE.test(file)
          ? { crossorigin: '' }
          : {})
      }
    ])

  const preloadHeadTags = toHeadTags(preloadLinks, 'modulepreload')
  const prefetchHeadTags = toHeadTags(prefetchLinks, 'prefetch')

  const pageHeadTags: HeadConfig[] = relativeBase
    ? JSON.parse(desentinel(JSON.stringify(additionalHeadTags)))
    : additionalHeadTags

  const headBeforeTransform = [
    ...pageHeadTags,
    ...preloadHeadTags,
    ...prefetchHeadTags,
    ...mergeHead(
      siteData.head,
      filterOutHeadDescription(pageData.frontmatter.head)
    )
  ]

  const transformContext = (head: HeadConfig[]) => ({
    page,
    siteConfig: config,
    siteData,
    pageData,
    title,
    description,
    head,
    content,
    assets: pageAssets
  })

  const head = mergeHead(
    headBeforeTransform,
    (await config.transformHead?.(transformContext(headBeforeTransform))) || []
  )

  const stylesheetLink = cssChunk
    ? `<link rel="preload stylesheet" href="${assetUrl(cssChunk.fileName)}" as="style">`
    : ''

  let inlinedScript = ''
  if (config.mpa && result) {
    const matchingChunk = result.output.find(
      (chunk): chunk is Rolldown.OutputChunk =>
        chunk.type === 'chunk' &&
        chunk.facadeModuleId === slash(path.join(config.srcDir, page))
    )
    if (matchingChunk) {
      if (!matchingChunk.code.includes('import')) {
        inlinedScript = `<script type="module">${matchingChunk.code}</script>`
        await rm(path.resolve(config.outDir, matchingChunk.fileName), {
          force: true
        })
      } else {
        inlinedScript = `<script type="module" src="${assetUrl(matchingChunk.fileName)}"${assetsCrossOrigin}></script>`
      }
    }
  }

  const html = `<!DOCTYPE html>
<html lang="${siteData.lang}" dir="${dir}">
  <head>
    <meta charset="utf-8">
    ${
      hasNamedMeta(head, 'viewport')
        ? ''
        : '<meta name="viewport" content="width=device-width,initial-scale=1">'
    }
    <title>${escapeHtml(title)}</title>
    ${
      hasNamedMeta(head, 'description')
        ? ''
        : `<meta name="description" content="${escapeHtml(description)}">`
    }
    <meta name="generator" content="VitePress v${version}">
    ${
      // recovers the absolute site root at runtime; a classic inline script
      // so it runs before any module resolves URLs
      relativeBase && !config.mpa
        ? `<script>window.__VP_SITE_ROOT__=new URL("${pageBase}",location).href</script>`
        : ''
    }
    ${stylesheetLink}
    <link rel="preload stylesheet" href="${assetUrl(`${config.assetsDir}/${vpIconsFileName(VP_ICONS_HASH_PLACEHOLDER)}`)}" as="style"${assetsCrossOrigin}>
    ${metadataScript.inHead ? metadataScript.html : ''}
    ${
      appChunk
        ? `<script type="module" src="${assetUrl(appChunk.fileName)}"${assetsCrossOrigin}></script>`
        : ''
    }
    ${await renderHead(head)}
  </head>
  <body>${teleports?.body || ''}
    <div id="app">${page === '404.md' ? '' : content}</div>
    ${metadataScript.inHead ? '' : metadataScript.html}
    ${inlinedScript}
  </body>
</html>`

  const htmlFileName = path.join(config.outDir, page.replace(/\.md$/, '.html'))
  await mkdir(path.dirname(htmlFileName), { recursive: true })
  const finalHtml = desentinel(html)
  const transformedHtml = await config.transformHtml?.(
    finalHtml,
    htmlFileName,
    transformContext(head)
  )
  await writeFile(htmlFileName, transformedHtml || finalHtml)
}

async function resolvePageImports(
  config: SiteConfig,
  page: string,
  result: Rolldown.RolldownOutput,
  appChunk: Rolldown.OutputChunk
) {
  page = config.rewrites.inv[page] || page
  let srcPath = path.resolve(config.srcDir, page)
  try {
    if (!config.vite?.resolve?.preserveSymlinks) {
      srcPath = await realpath(srcPath)
    }
  } catch {
    // virtual pages generated by dynamic routes have no file on disk
  }
  srcPath = normalizePath(srcPath)
  const pageChunk = result.output.find(
    (chunk): chunk is Rolldown.OutputChunk =>
      chunk.type === 'chunk' && chunk.facadeModuleId === srcPath
  )
  // dynamic imports are intentionally not preloaded
  return [...appChunk.imports, ...(pageChunk?.imports || [])]
}

async function renderHead(head: HeadConfig[]): Promise<string> {
  const tags = await Promise.all(
    head.map(async ([tag, attrs = {}, innerHTML = '']) => {
      const openTag = `<${tag}${renderAttrs(attrs)}>`
      if (tag === 'link' || tag === 'meta') return openTag
      if (
        tag === 'script' &&
        (attrs.type === undefined || attrs.type.includes('javascript'))
      ) {
        innerHTML = (await minify('inline-script.js', innerHTML)).code
      }
      return `${openTag}${innerHTML}</${tag}>`
    })
  )
  return tags.join('\n    ')
}

function renderAttrs(attrs: Record<string, string>): string {
  return Object.keys(attrs)
    .map((key) =>
      isBooleanAttr(key) ? ` ${key}` : ` ${key}="${escapeHtml(attrs[key])}"`
    )
    .join('')
}

function filterOutHeadDescription(head: HeadConfig[] = []) {
  return head.filter(
    ([type, attrs]) => !(type === 'meta' && attrs?.name === 'description')
  )
}

function hasNamedMeta(head: HeadConfig[], name: string) {
  return head.some(([type, attrs]) => type === 'meta' && attrs?.name === name)
}
