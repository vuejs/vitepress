import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import pMap from 'p-map'
import type { SiteConfig } from '../config'
import { disposeMdItInstance } from '../markdown/markdown'
import { clearCache } from '../markdownToVue'
import { slash, type HeadConfig, type SSGContext } from '../shared'
import { deserializeFunctions, serializeFunctions } from '../utils/fnSerialize'
import { nativeImport } from '../utils/nativeImport'
import { createRenderMetadata, renderPage, type RenderMetadata } from './render'

export function disposeBuildCaches(): void {
  clearBuildCaches()
  disposeMdItInstance()
}

export function clearBuildCaches(): void {
  clearCache()
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
  if (config.mpa) {
    return { html: '', inHead: false }
  }

  // We embed the hash map and site config strings into each page directly
  // so that it doesn't alter the main chunk's hash on every build.
  // It's also embedded as a string and JSON.parsed from the client because
  // it's faster than embedding as JS object literal.
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
  const metadataFileURL = slash(`${config.site.base}${metadataFile}`)

  await mkdir(path.dirname(resolvedMetadataFile), { recursive: true })
  await writeFile(resolvedMetadataFile, metadataContent)

  return {
    html: `<script type="module" src="${metadataFileURL}"></script>`,
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

export async function getRenderer(tempDir: string) {
  const { render } = await nativeImport(path.join(tempDir, 'app.js'))
  return render as (path: string) => Promise<SSGContext>
}

export async function renderPages(
  render: (path: string) => Promise<SSGContext>,
  siteConfig: SiteConfig,
  serverTempDir: string,
  pages: string[],
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

export function createRouteDigest(siteConfig: SiteConfig): string {
  const hash = createHash('sha256')
  const add = (value: string | undefined) => {
    if (value === undefined) {
      hash.update('-1:')
    } else {
      hash.update(`${Buffer.byteLength(value)}:`)
      hash.update(value)
    }
  }
  const sortEntries = (entries: [string, string | undefined][]) =>
    entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))

  hash.update('pages:')
  siteConfig.pages.forEach(add)

  hash.update(`dynamicRoutes:${siteConfig.dynamicRoutes.length}:`)
  for (const route of siteConfig.dynamicRoutes) {
    add(route.route)
    add(route.path)
    add(route.fullPath)
    add(route.loaderPath)
    const params = sortEntries(Object.entries(route.params))
    hash.update(`params:${params.length}:`)
    for (const [key, value] of params) {
      add(key)
      add(value)
    }
    add(route.content)
  }

  hash.update('rewrites.map:')
  for (const [key, value] of sortEntries(
    Object.entries(siteConfig.rewrites.map)
  )) {
    add(key)
    add(value)
  }
  hash.update('rewrites.inv:')
  for (const [key, value] of sortEntries(
    Object.entries(siteConfig.rewrites.inv)
  )) {
    add(key)
    add(value)
  }

  return hash.digest('hex')
}
