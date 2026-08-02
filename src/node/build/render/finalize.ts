import { isBooleanAttr } from '@vue/shared'
import { mkdir, realpath, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { minify, normalizePath } from 'vite'
import { version } from '../../../../package.json'
import type { SiteConfig } from '../../config'
import {
  EXTERNAL_URL_RE,
  createTitle,
  escapeHtml,
  mergeHead,
  resolveSiteDataByRoute,
  sanitizeFileName,
  type HeadConfig
} from '../../shared'
import type { RenderMetadata } from './metadata'
import type { RenderedPage } from './page'

export async function finalizeRenderedPage(
  renderedPage: RenderedPage,
  config: SiteConfig,
  renderMetadata: RenderMetadata,
  pageToHashMap: Record<string, string>,
  metadataScript: { html: string; inHead: boolean },
  additionalHeadTags: HeadConfig[],
  usedIcons: Set<string>
): Promise<void> {
  const { page, pageData, hasCustom404 } = renderedPage
  const context =
    (await config.postRender?.(renderedPage.context)) ?? renderedPage.context
  const { content, teleports, vpSocialIcons } = context
  const { appChunk, cssChunk, assets, pageImports, pageChunks } = renderMetadata

  vpSocialIcons.forEach((icon) => usedIcons.add(icon))

  const pageName = sanitizeFileName(page.replace(/\//g, '_'))
  const pageHash = pageToHashMap[pageName.toLowerCase()]
  const pageClientJsFileName = `${config.assetsDir}/${pageName}.${pageHash}.lean.js`
  const siteData = resolveSiteDataByRoute(config.site, page, pageData.filePath)
  const title = createTitle(siteData, pageData)
  const description = pageData.description || siteData.description
  const stylesheetLink = cssChunk
    ? `<link rel="preload stylesheet" href="${siteData.base}${cssChunk.fileName}" as="style">`
    : ''

  let preloadLinks =
    config.mpa || (!hasCustom404 && page === '404.md')
      ? []
      : appChunk
        ? [
            ...new Set([
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

  if (config.shouldPreload) {
    prefetchLinks = preloadLinks.filter(
      (link) => !config.shouldPreload!(link, page)
    )
    preloadLinks = preloadLinks.filter((link) =>
      config.shouldPreload!(link, page)
    )
  }

  const toHeadTags = (files: string[], rel: string): HeadConfig[] =>
    files.map((file) => [
      'link',
      {
        rel,
        href: (EXTERNAL_URL_RE.test(file) ? '' : siteData.base) + file
      }
    ])
  const headBeforeTransform = [
    ...additionalHeadTags,
    ...toHeadTags(preloadLinks, 'modulepreload'),
    ...toHeadTags(prefetchLinks, 'prefetch'),
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
  let srcPath = path.resolve(config.srcDir, page)
  try {
    if (!config.vite?.resolve?.preserveSymlinks) {
      srcPath = await realpath(srcPath)
    }
  } catch {}
  srcPath = normalizePath(srcPath)
  return [...appChunk.imports, ...(pageImports.get(srcPath) || [])]
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
      }
      return openTag
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
  return head.filter(
    ([type, attrs]) => !(type === 'meta' && attrs?.name === 'description')
  )
}

function isDescriptionOverridden(head: HeadConfig[] = []) {
  return head.some(
    ([type, attrs]) => type === 'meta' && attrs?.name === 'description'
  )
}

function isMetaViewportOverridden(head: HeadConfig[] = []) {
  return head.some(
    ([type, attrs]) => type === 'meta' && attrs?.name === 'viewport'
  )
}
