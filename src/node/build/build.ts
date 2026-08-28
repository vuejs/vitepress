import { createHash } from 'node:crypto'
import fs from 'node:fs'
import {
  mkdir,
  readFile,
  rm,
  symlink,
  unlink,
  writeFile
} from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

import pMap from 'p-map'
import c from 'picocolors'
import { packageDirectory } from 'package-directory'
import type { BuildOptions, Rolldown } from 'vite'

import {
  normalizeAssetsBase,
  normalizeSiteBase,
  resolveConfig,
  type SiteConfig
} from '../config'
import { clearCache } from '../markdownToVue'
import type { PageMeta } from '../plugin'
import {
  EXTERNAL_URL_RE,
  RELATIVE_BASE_SENTINEL,
  isRelativeBase,
  slash,
  type Awaitable,
  type HeadConfig
} from '../shared'
import {
  VP_ICONS_HASH_PLACEHOLDER,
  generateIconsCSS,
  vpIconsFileName
} from '../icons'
import { deserializeFunctions, serializeFunctions } from '../utils/fnSerialize'
import { logVersion } from '../utils/logVersion'
import { nativeImport } from '../utils/nativeImport'
import { task } from '../utils/task'
import { bundle } from './bundle'
import { generateSitemap } from './generateSitemap'
import { renderPage } from './render'

export async function build(
  root?: string,
  buildOptions: BuildOptions & {
    base?: string
    assetsBase?: string
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
    if (typeof buildOptions.base !== 'string') {
      throw new Error('--base requires a value (e.g. --base /docs/)')
    }
    siteConfig.site.base = normalizeSiteBase(buildOptions.base)
    delete buildOptions.base
  }

  if (buildOptions.assetsBase) {
    if (typeof buildOptions.assetsBase !== 'string') {
      throw new Error(
        '--assetsBase requires a value (e.g. --assetsBase https://cdn.example.com/)'
      )
    }
    siteConfig.assetsBase = normalizeAssetsBase(buildOptions.assetsBase)
    delete buildOptions.assetsBase
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

  const resultOutput: (Rolldown.OutputChunk | Rolldown.OutputAsset)[] =
    (siteConfig.mpa ? serverResult : clientResult)?.output || []

  const appChunk = clientOutput.find(
    (chunk): chunk is Rolldown.OutputChunk =>
      chunk.type === 'chunk' &&
      chunk.isEntry &&
      !!chunk.facadeModuleId?.endsWith('.js')
  )

  const isDefaultTheme = resultOutput.some(
    (chunk): chunk is Rolldown.OutputChunk =>
      chunk.type === 'chunk' &&
      chunk.moduleIds.some((id) => id.includes('client/theme-default'))
  )

  const cssChunk = resultOutput.find(
    (chunk): chunk is Rolldown.OutputAsset =>
      chunk.type === 'asset' && chunk.fileName.endsWith('.css')
  )

  const assetsUrlBase =
    siteConfig.assetsBase ??
    (isRelativeBase(siteConfig.site.base)
      ? RELATIVE_BASE_SENTINEL
      : siteConfig.site.base)

  // prettier-ignore
  const assets = resultOutput.filter(
    (chunk): chunk is Rolldown.OutputAsset =>
      chunk.type === 'asset' && !chunk.fileName.endsWith('.css')
  ).map((asset) => assetsUrlBase + asset.fileName)

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

  // pre-seeded with icons SSR collection cannot see (client-only renders)
  const include = siteConfig.icons?.include
  const usedIcons = new Set<string>(Array.isArray(include) ? include : [])

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

  await emitIconsCSS(siteConfig, usedIcons)

  // emit page hash map for the case where a user session is open
  // when the site got redeployed (which invalidates current hash map)
  await writeFile(
    path.join(siteConfig.outDir, 'hashmap.json'),
    JSON.stringify(pageToHashMap)
  )
}

async function emitIconsCSS(
  config: SiteConfig,
  usedIcons: Set<string>
): Promise<void> {
  const { css, warnings } = await generateIconsCSS(
    config.root,
    usedIcons,
    process.env.DEBUG ? 'expanded' : 'compressed'
  )
  for (const warning of warnings) {
    config.logger.warn(c.yellow(`(icons) ${warning}`))
  }

  const assetsDir = path.join(config.outDir, config.assetsDir)
  const placeholder = vpIconsFileName(VP_ICONS_HASH_PLACEHOLDER)

  let hashedName = ''
  if (css) {
    hashedName = vpIconsFileName(
      createHash('sha256').update(css).digest('hex').slice(0, 8)
    )
    await mkdir(assetsDir, { recursive: true })
    await writeFile(path.join(assetsDir, hashedName), css)
  }

  const linkRE = new RegExp(
    `[ \\t]*<link\\b[^>]*${VP_ICONS_HASH_PLACEHOLDER}[^>]*>\\n?`
  )
  await pMap(
    ['404.md', ...config.pages],
    async (page) => {
      const file = path.join(
        config.outDir,
        (config.rewrites.map[page] || page).replace(/\.md$/, '.html')
      )
      const html = await readFile(file, 'utf-8').catch(() => null)
      if (html === null || !html.includes(placeholder)) return
      // scoped to the tag so prose mentioning the placeholder stays intact
      await writeFile(
        file,
        html.replace(linkRE, (tag) =>
          hashedName ? tag.replaceAll(placeholder, hashedName) : ''
        )
      )
    },
    { concurrency: config.buildConcurrency }
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
  const fns: string[] = []
  const siteDataString = JSON.stringify(
    JSON.stringify(serializeFunctions({ ...config.site, head: [] }, fns))
  )

  const metadataContent = `window.__VP_HASH_MAP__=JSON.parse(${hashMapString});${
    fns.length
      ? `${deserializeFunctions};window.__VP_SITE_DATA__=deserializeFunctions(JSON.parse(${siteDataString}),[${fns.join(',')}]);`
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
  const urlBase =
    config.assetsBase ??
    (isRelativeBase(config.site.base)
      ? RELATIVE_BASE_SENTINEL
      : config.site.base)
  const metadataFileURL = urlBase + slash(metadataFile)
  const crossorigin =
    config.assetsBase && EXTERNAL_URL_RE.test(config.assetsBase)
      ? ' crossorigin'
      : ''

  await mkdir(path.dirname(resolvedMetadataFile), { recursive: true })
  await writeFile(resolvedMetadataFile, metadataContent)

  return {
    html: `<script type="module" src="${metadataFileURL}"${crossorigin}></script>`,
    inHead: true
  }
}
