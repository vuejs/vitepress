import path from 'node:path'
import pMap from 'p-map'
import type { SiteConfig } from '../../config'
import {
  notFoundPageData,
  sanitizeFileName,
  type HeadConfig,
  type PageData,
  type SSGContext
} from '../../shared'
import { nativeImport } from '../../utils/nativeImport'
import { finalizeRenderedPage } from './finalize'
import type { RenderMetadata } from './metadata'

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

export async function renderPage(
  render: (path: string) => Promise<SSGContext>,
  config: SiteConfig,
  page: string,
  renderMetadata: RenderMetadata,
  pageToHashMap: Record<string, string>,
  metadataScript: { html: string; inHead: boolean },
  additionalHeadTags: HeadConfig[],
  usedIcons: Set<string>,
  serverTempDir = config.tempDir
): Promise<void> {
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
  } catch (error) {
    if (page === '404.md') {
      hasCustom404 = false
      pageData = notFoundPageData
    } else {
      throw error
    }
  }

  return { page, pageData, hasCustom404, context }
}

export function serializeRenderedPage(
  renderedPage: RenderedPage
): SerializedRenderedPage {
  const context = {
    ...renderedPage.context,
    vpSocialIcons: [...renderedPage.context.vpSocialIcons].sort()
  } as SerializedSSGContext & {
    __teleportBuffers?: unknown
    __watcherHandles?: unknown
  }
  delete context.__teleportBuffers
  delete context.__watcherHandles

  return { ...renderedPage, context }
}

export function deserializeRenderedPage(
  renderedPage: SerializedRenderedPage
): RenderedPage {
  return {
    ...renderedPage,
    context: {
      ...renderedPage.context,
      vpSocialIcons: new Set(renderedPage.context.vpSocialIcons)
    }
  }
}

export async function getRenderer(tempDir: string) {
  const { render } = await nativeImport(path.join(tempDir, 'app.js'))
  return render as (path: string) => Promise<SSGContext>
}

export async function renderPages(
  render: (path: string) => Promise<SSGContext>,
  siteConfig: SiteConfig,
  serverTempDir: string,
  pages: readonly string[],
  renderMetadata: RenderMetadata,
  pageToHashMap: Record<string, string>,
  metadataScript: { html: string; inHead: boolean },
  additionalHeadTags: HeadConfig[],
  usedIcons: Set<string>
): Promise<void> {
  await pMap(
    pages,
    async (page) => {
      await renderPage(
        render,
        siteConfig,
        siteConfig.rewrites.map[page] || page,
        renderMetadata,
        pageToHashMap,
        metadataScript,
        additionalHeadTags,
        usedIcons,
        serverTempDir
      )
    },
    { concurrency: siteConfig.buildConcurrency }
  )
}
