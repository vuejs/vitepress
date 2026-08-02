import { isBooleanAttr } from '@vue/shared'
import { mkdir, realpath, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { minify, normalizePath, type Rolldown } from 'vite'
import { version } from '../../../package.json'
import type { SiteConfig } from '../config'
import {
  EXTERNAL_URL_RE,
  createTitle,
  escapeHtml,
  mergeHead,
  notFoundPageData,
  resolveSiteDataByRoute,
  sanitizeFileName,
  type HeadConfig,
  type PageData,
  type SSGContext
} from '../shared'
import { nativeImport } from '../utils/nativeImport'

export interface PageChunkInfo {
  fileName: string
  code: string
}

export interface RenderMetadata {
  appChunk?: { fileName: string; imports: string[] }
  cssChunk?: { fileName: string }
  assets: string[]
  isDefaultTheme: boolean
  pageImports: Map<string, string[]>
  pageChunks: Map<string, PageChunkInfo>
}

export interface SerializedRenderMetadata extends Omit<
  RenderMetadata,
  'pageImports' | 'pageChunks'
> {
  pageImports: [string, string[]][]
  pageChunks: [string, PageChunkInfo][]
}

/**
 * The output of Vue SSR before VitePress runs user hooks and writes HTML.
 *
 * Keeping this boundary free of SiteConfig allows lightweight render workers
 * to return their result to the coordinator, where closure-bearing build hooks
 * can run without resolving the user's config again.
 */
export interface RenderedPage {
  page: string
  pageData: PageData
  hasCustom404: boolean
  context: SSGContext
}

export type SerializedSSGContext = Omit<SSGContext, 'vpSocialIcons'> & {
  vpSocialIcons: string[]
}

export interface SerializedRenderedPage extends Omit<RenderedPage, 'context'> {
  context: SerializedSSGContext
}

export function createRenderMetadata(
  config: SiteConfig,
  clientResult: Rolldown.RolldownOutput | null | undefined,
  serverResult: Rolldown.RolldownOutput | null | undefined
): RenderMetadata {
  const clientOutput = clientResult?.output ?? []
  const assetOutput = (config.mpa ? serverResult : clientResult)?.output ?? []

  const cssChunk = assetOutput.find(
    (chunk): chunk is Rolldown.OutputAsset =>
      chunk.type === 'asset' && chunk.fileName.endsWith('.css')
  )

  const assets = assetOutput
    .filter(
      (chunk): chunk is Rolldown.OutputAsset =>
        chunk.type === 'asset' && !chunk.fileName.endsWith('.css')
    )
    .map((asset) => config.site.base + asset.fileName)

  const isDefaultTheme = clientOutput.some(
    (chunk): chunk is Rolldown.OutputChunk =>
      chunk.type === 'chunk' &&
      chunk.name === 'theme' &&
      chunk.moduleIds.some((id) => id.includes('client/theme-default'))
  )

  const pageImports = new Map<string, string[]>()
  const pageChunks = new Map<string, PageChunkInfo>()
  let appChunk: RenderMetadata['appChunk']
  for (const chunk of clientOutput) {
    if (chunk.type !== 'chunk') continue

    if (!appChunk && chunk.isEntry && chunk.facadeModuleId?.endsWith('.js')) {
      appChunk = { fileName: chunk.fileName, imports: [...chunk.imports] }
    }

    if (!chunk.isEntry || !chunk.facadeModuleId?.endsWith('.md')) {
      continue
    }

    const facadeModuleId = normalizePath(chunk.facadeModuleId)
    if (config.mpa) {
      pageChunks.set(facadeModuleId, {
        fileName: chunk.fileName,
        code: chunk.code
      })
    } else {
      pageImports.set(facadeModuleId, [...chunk.imports])
    }
  }

  return {
    appChunk,
    cssChunk: cssChunk ? { fileName: cssChunk.fileName } : undefined,
    assets,
    isDefaultTheme,
    pageImports,
    pageChunks
  }
}

export function serializeRenderMetadata(
  metadata: RenderMetadata
): SerializedRenderMetadata {
  return {
    ...metadata,
    pageImports: [...metadata.pageImports],
    pageChunks: [...metadata.pageChunks]
  }
}

export function deserializeRenderMetadata(
  metadata: SerializedRenderMetadata
): RenderMetadata {
  return {
    ...metadata,
    pageImports: new Map(metadata.pageImports),
    pageChunks: new Map(metadata.pageChunks)
  }
}

export async function renderPage(
  render: (path: string) => Promise<SSGContext>,
  config: SiteConfig,
  page: string, // foo.md
  renderMetadata: RenderMetadata,
  pageToHashMap: Record<string, string>,
  metadataScript: { html: string; inHead: boolean },
  additionalHeadTags: HeadConfig[],
  usedIcons: Set<string>,
  serverTempDir = config.tempDir
) {
  const pageName = sanitizeFileName(page.replace(/\//g, '_'))
  const renderedPage = await renderPageToResult(
    render,
    page,
    path.join(serverTempDir, pageName + '.js')
  )

  await finalizeRenderedPage(
    renderedPage,
    config,
    renderMetadata,
    pageToHashMap,
    metadataScript,
    additionalHeadTags,
    usedIcons
  )
}

/**
 * Render a page and load its page data without invoking user build hooks or
 * writing to the final output directory.
 */
export async function renderPageToResult(
  render: (path: string) => Promise<SSGContext>,
  page: string,
  pageModulePath: string
): Promise<RenderedPage> {
  const routePath = `/${page.replace(/\.md$/, '')}`
  const context = await render(routePath)

  let pageData: PageData
  let hasCustom404 = true

  try {
    const { __pageData } = await nativeImport(pageModulePath)
    pageData = __pageData
  } catch (e) {
    if (page === '404.md') {
      hasCustom404 = false
      pageData = notFoundPageData
    } else {
      throw e
    }
  }

  return { page, pageData, hasCustom404, context }
}

/** Convert Set-backed SSR state into a transport-friendly representation. */
export function serializeRenderedPage(
  renderedPage: RenderedPage
): SerializedRenderedPage {
  return {
    ...renderedPage,
    context: {
      ...renderedPage.context,
      vpSocialIcons: [...renderedPage.context.vpSocialIcons].sort()
    }
  }
}

/** Restore the SSR context shape expected by postRender and the finalizer. */
export function deserializeRenderedPage(
  renderedPage: SerializedRenderedPage
): RenderedPage {
  return {
    ...renderedPage,
    context: {
      ...renderedPage.context,
      content: renderedPage.context.content,
      vpSocialIcons: new Set(renderedPage.context.vpSocialIcons)
    }
  }
}

/**
 * Run coordinator-owned hooks and emit one final HTML page.
 */
export async function finalizeRenderedPage(
  renderedPage: RenderedPage,
  config: SiteConfig,
  renderMetadata: RenderMetadata,
  pageToHashMap: Record<string, string>,
  metadataScript: { html: string; inHead: boolean },
  additionalHeadTags: HeadConfig[],
  usedIcons: Set<string>
) {
  const { page, pageData, hasCustom404 } = renderedPage
  const context =
    (await config.postRender?.(renderedPage.context)) ?? renderedPage.context
  const { content, teleports, vpSocialIcons } = context
  const { appChunk, cssChunk, assets, pageImports, pageChunks } = renderMetadata

  vpSocialIcons.forEach((icon) => usedIcons.add(icon))

  const pageName = sanitizeFileName(page.replace(/\//g, '_'))
  // for any initial page load, we only need the lean version of the page js
  // since the static content is already on the page!
  const pageHash = pageToHashMap[pageName.toLowerCase()]
  const pageClientJsFileName = `${config.assetsDir}/${pageName}.${pageHash}.lean.js`

  const siteData = resolveSiteDataByRoute(config.site, page, pageData.filePath)

  const title: string = createTitle(siteData, pageData)
  const description: string = pageData.description || siteData.description
  const stylesheetLink = cssChunk
    ? `<link rel="preload stylesheet" href="${siteData.base}${cssChunk.fileName}" as="style">`
    : ''

  let preloadLinks =
    config.mpa || (!hasCustom404 && page === '404.md')
      ? []
      : appChunk
        ? [
            ...new Set([
              // resolve imports for index.js + page.md.js and inject script tags
              // for them as well so we fetch everything as early as possible
              // without having to wait for entry chunks to parse
              ...(await resolvePageImports(
                config,
                page,
                pageImports,
                appChunk
              )),
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
  if (config.mpa) {
    const matchingChunk = pageChunks.get(
      normalizePath(path.join(config.srcDir, page))
    )
    if (matchingChunk) {
      if (!matchingChunk.code.includes('import')) {
        inlinedScript = `<script type="module">${matchingChunk.code}</script>`
        await rm(path.resolve(config.outDir, matchingChunk.fileName), {
          force: true
        })
      } else {
        inlinedScript = `<script type="module" src="${siteData.base}${matchingChunk.fileName}"></script>`
      }
    }
  }

  const dir = pageData.frontmatter.dir || siteData.dir || 'ltr'

  const html = `<!DOCTYPE html>
<html lang="${siteData.lang}" dir="${dir}">
  <head>
    <meta charset="utf-8">
    ${
      isMetaViewportOverridden(head)
        ? ''
        : '<meta name="viewport" content="width=device-width,initial-scale=1">'
    }
    <title>${escapeHtml(title)}</title>
    ${
      isDescriptionOverridden(head)
        ? ''
        : `<meta name="description" content="${escapeHtml(description)}">`
    }
    <meta name="generator" content="VitePress v${version}">
    ${stylesheetLink}
    <link rel="preload stylesheet" href="${siteData.base}vp-icons.css" as="style">
    ${metadataScript.inHead ? metadataScript.html : ''}
    ${
      appChunk
        ? `<script type="module" src="${siteData.base}${appChunk.fileName}"></script>`
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
  await writeFile(htmlFileName, transformedHtml || html)
}

async function resolvePageImports(
  config: SiteConfig,
  page: string,
  pageImports: Map<string, string[]>,
  appChunk: { fileName: string; imports: string[] }
) {
  page = config.rewrites.inv[page] || page
  // find the page's js chunk and inject script tags for its imports so that
  // they start fetching as early as possible
  let srcPath = path.resolve(config.srcDir, page)
  try {
    if (!config.vite?.resolve?.preserveSymlinks) {
      srcPath = await realpath(srcPath)
    }
  } catch (e) {
    // if the page is a virtual page generated by a dynamic route this would
    // fail, which is expected
  }
  srcPath = normalizePath(srcPath)
  const imports = pageImports.get(srcPath) || []
  return [
    ...appChunk.imports,
    // ...appChunk.dynamicImports,
    ...imports
    // ...pageChunk.dynamicImports
  ]
}

async function renderHead(head: HeadConfig[]): Promise<string> {
  const tags = await Promise.all(
    head.map(async ([tag, attrs = {}, innerHTML = '']) => {
      const openTag = `<${tag}${renderAttrs(attrs)}>`
      if (tag !== 'link' && tag !== 'meta') {
        if (
          tag === 'script' &&
          (attrs.type === undefined || attrs.type.includes('javascript'))
        ) {
          innerHTML = (await minify('inline-script.js', innerHTML)).code
        }
        return `${openTag}${innerHTML}</${tag}>`
      } else {
        return openTag
      }
    })
  )
  return tags.join('\n    ')
}

function renderAttrs(attrs: Record<string, string>): string {
  return Object.keys(attrs)
    .map((key) => {
      if (isBooleanAttr(key)) return ` ${key}`
      return ` ${key}="${escapeHtml(attrs[key] as string)}"`
    })
    .join('')
}

function filterOutHeadDescription(head: HeadConfig[] = []) {
  return head.filter(([type, attrs]) => {
    return !(type === 'meta' && attrs?.name === 'description')
  })
}

function isDescriptionOverridden(head: HeadConfig[] = []) {
  return head.some(([type, attrs]) => {
    return type === 'meta' && attrs?.name === 'description'
  })
}

function isMetaViewportOverridden(head: HeadConfig[] = []) {
  return head.some(([type, attrs]) => {
    return type === 'meta' && attrs?.name === 'viewport'
  })
}
