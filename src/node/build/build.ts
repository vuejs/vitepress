import { getIconsCSS } from '@iconify/utils'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { mkdir, rm, symlink, unlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import pMap from 'p-map'
import { packageDirectory } from 'package-directory'
import type { BuildOptions, Rolldown } from 'vite'
import { resolveConfig, type SiteConfig } from '../config'
import { clearCache } from '../markdownToVue'
import type { PageMeta } from '../plugin'
import { slash, type Awaitable, type HeadConfig } from '../shared'
import { deserializeFunctions, serializeFunctions } from '../utils/fnSerialize'
import { logVersion } from '../utils/logVersion'
import { nativeImport } from '../utils/nativeImport'
import { task } from '../utils/task'
import { bundle } from './bundle'
import { generateSitemap } from './generateSitemap'
import { renderPage } from './render'

const require = createRequire(import.meta.url)

export async function build(
  root?: string,
  buildOptions: BuildOptions & {
    base?: string
    mpa?: string
    onAfterConfigResolve?: (siteConfig: SiteConfig) => Awaitable<void>
  } = {}
) {
  const start = performance.now()

  process.env.NODE_ENV = 'production'
  const siteConfig = await resolveConfig(root, 'build', 'production')

  if (buildOptions.onAfterConfigResolve) {
    await buildOptions.onAfterConfigResolve(siteConfig)
  } else {
    logVersion(siteConfig.logger)
  }
  delete buildOptions.onAfterConfigResolve

  const unlinkVue = await linkVue()

  if (buildOptions.base) {
    siteConfig.site.base = buildOptions.base
    delete buildOptions.base
  }

  if (buildOptions.mpa) {
    siteConfig.mpa = true
    delete buildOptions.mpa
  }

  if (buildOptions.outDir) {
    siteConfig.outDir = path.resolve(process.cwd(), buildOptions.outDir)
    delete buildOptions.outDir
  }

  const pageMetaMap = Object.create(null) as Record<string, PageMeta>

  try {
    const out = await task(
      'building client + server bundles',
      bundle.bind(null, siteConfig, buildOptions, pageMetaMap)
    )

    if (process.env.BUNDLE_ONLY) {
      return
    }

    await task('rendering pages', render.bind(null, siteConfig, out))
  } finally {
    await unlinkVue()
    if (!process.env.DEBUG) {
      await rm(siteConfig.tempDir, {
        recursive: true,
        force: true,
        maxRetries: 10
      })
    }
  }

  if (siteConfig.sitemap?.hostname) {
    await task(
      'generating sitemap',
      generateSitemap.bind(null, siteConfig, pageMetaMap)
    )
  }

  await siteConfig.buildEnd?.(siteConfig)
  clearCache()

  siteConfig.logger.info(
    `build complete in ${((performance.now() - start) / 1000).toFixed(2)}s.`
  )
}

async function linkVue() {
  const root = await packageDirectory()
  if (root) {
    const dest = path.resolve(root, 'node_modules/vue')
    // if user did not install vue by themselves, link VitePress' version
    if (!fs.existsSync(dest)) {
      const src = path.dirname(createRequire(import.meta.url).resolve('vue'))
      await mkdir(path.dirname(dest), { recursive: true })
      await symlink(src, dest, 'junction')
      return () => unlink(dest)
    }
  }
  return async () => {}
}

async function render(
  siteConfig: SiteConfig,
  {
    clientResult,
    serverResult,
    pageToHashMap
  }: Awaited<ReturnType<typeof bundle>>
): Promise<void> {
  const entryPath = path.join(siteConfig.tempDir, 'app.js')
  const { render } = await nativeImport(entryPath)

  const clientOutput: (Rolldown.OutputChunk | Rolldown.OutputAsset)[] =
    clientResult?.output || []

  const appChunk = clientOutput.find(
    (chunk): chunk is Rolldown.OutputChunk =>
      chunk.type === 'chunk' &&
      chunk.isEntry &&
      !!chunk.facadeModuleId?.endsWith('.js')
  )

  const isDefaultTheme = clientOutput.some(
    (chunk): chunk is Rolldown.OutputChunk =>
      chunk.type === 'chunk' &&
      chunk.name === 'theme' &&
      chunk.moduleIds.some((id) => id.includes('client/theme-default'))
  )

  // ----

  const resultOutput: (Rolldown.OutputChunk | Rolldown.OutputAsset)[] =
    (siteConfig.mpa ? serverResult : clientResult)?.output || []

  const cssChunk = resultOutput.find(
    (chunk): chunk is Rolldown.OutputAsset =>
      chunk.type === 'asset' && chunk.fileName.endsWith('.css')
  )

  // prettier-ignore
  const assets = resultOutput.filter(
    (chunk): chunk is Rolldown.OutputAsset =>
      chunk.type === 'asset' && !chunk.fileName.endsWith('.css')
  ).map((asset) => siteConfig.site.base + asset.fileName)

  // ----

  const additionalHeadTags: HeadConfig[] = []
  const metadataScript = await generateMetadataScript(pageToHashMap, siteConfig)

  if (isDefaultTheme) {
    const fontURL = assets.find((file) =>
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

  const usedIcons = new Set<string>()

  await pMap(
    ['404.md', ...siteConfig.pages],
    async (page) => {
      await renderPage(
        render,
        siteConfig,
        siteConfig.rewrites.map[page] || page,
        clientResult,
        appChunk,
        cssChunk,
        assets,
        pageToHashMap,
        metadataScript,
        additionalHeadTags,
        usedIcons
      )
    },
    { concurrency: siteConfig.buildConcurrency }
  )

  const icons = require('@iconify-json/simple-icons/icons.json')
  const iconsCss = getIconsCSS(icons, Array.from(usedIcons).sort(), {
    iconSelector: '.vpi-social-{name}',
    commonSelector: '.vpi-social',
    varName: 'icon',
    format: process.env.DEBUG ? 'expanded' : 'compressed',
    mode: 'mask'
  }).replace(/[^]*?}\n*/, '')

  await writeFile(path.join(siteConfig.outDir, 'vp-icons.css'), iconsCss)

  // emit page hash map for the case where a user session is open
  // when the site got redeployed (which invalidates current hash map)
  await writeFile(
    path.join(siteConfig.outDir, 'hashmap.json'),
    JSON.stringify(pageToHashMap)
  )
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
