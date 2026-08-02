import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { normalizePath, type Rolldown } from 'vite'
import type { SiteConfig } from '../../config'
import { slash, type HeadConfig } from '../../shared'
import {
  deserializeFunctions,
  serializeFunctions
} from '../../utils/fnSerialize'

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
    if (!chunk.isEntry || !chunk.facadeModuleId?.endsWith('.md')) continue

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

function createAdditionalHeadTags(
  renderMetadata: RenderMetadata
): HeadConfig[] {
  const additionalHeadTags: HeadConfig[] = []
  if (renderMetadata.isDefaultTheme) {
    const fontURL = renderMetadata.assets.find((file) =>
      /inter-roman-latin\.[\w-]+\.woff2/.test(file)
    )
    if (fontURL) {
      additionalHeadTags.push([
        'link',
        {
          rel: 'preload',
          href: fontURL,
          as: 'font',
          type: 'font/woff2',
          crossorigin: ''
        }
      ])
    }
  }
  return additionalHeadTags
}

async function generateMetadataScript(
  pageToHashMap: Record<string, string>,
  config: SiteConfig
): Promise<{ html: string; inHead: boolean }> {
  if (config.mpa) return { html: '', inHead: false }

  const hashMapString = JSON.stringify(JSON.stringify(pageToHashMap))
  const siteDataString = JSON.stringify(
    JSON.stringify(serializeFunctions({ ...config.site, head: [] }))
  )
  const metadataContent = `window.__VP_HASH_MAP__=JSON.parse(${hashMapString});${
    siteDataString.includes('_vp-fn_')
      ? `${deserializeFunctions};window.__VP_SITE_DATA__=deserializeFunctions(JSON.parse(${siteDataString}));`
      : `window.__VP_SITE_DATA__=JSON.parse(${siteDataString});`
  }`
  const metadataFile = path.join(
    config.assetsDir,
    'chunks',
    `metadata.${createHash('sha256')
      .update(metadataContent)
      .digest('hex')
      .slice(0, 8)}.js`
  )
  const resolvedMetadataFile = path.join(config.outDir, metadataFile)
  await mkdir(path.dirname(resolvedMetadataFile), { recursive: true })
  await writeFile(resolvedMetadataFile, metadataContent)

  return {
    html: `<script type="module" src="${slash(`${config.site.base}${metadataFile}`)}"></script>`,
    inHead: true
  }
}

export async function prepareRenderInputs(
  siteConfig: SiteConfig,
  clientResult: Parameters<typeof createRenderMetadata>[1],
  serverResult: Parameters<typeof createRenderMetadata>[2],
  pageToHashMap: Record<string, string>
) {
  const renderMetadata = createRenderMetadata(
    siteConfig,
    clientResult,
    serverResult
  )
  return {
    renderMetadata,
    additionalHeadTags: createAdditionalHeadTags(renderMetadata),
    metadataScript: await generateMetadataScript(pageToHashMap, siteConfig)
  }
}
