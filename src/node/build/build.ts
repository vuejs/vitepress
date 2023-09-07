import { createHash } from 'crypto'
import fs from 'fs-extra'
import { createRequire } from 'module'
import path from 'path'
import { packageDirectorySync } from 'pkg-dir'
import { rimraf } from 'rimraf'
import { pathToFileURL } from 'url'
import type { BuildOptions, Rollup } from 'vite'
import { resolveConfig, type SiteConfig } from '../config'
import { slash, type HeadConfig } from '../shared'
import { deserializeFunctions, serializeFunctions } from '../utils/fnSerialize'
import { task } from '../utils/task'
import { bundle } from './bundle'
import { generateSitemap } from './generateSitemap'
import { renderPage } from './render'

export async function build(
  root?: string,
  buildOptions: BuildOptions & { base?: string; mpa?: string } = {}
) {
  const start = Date.now()

  process.env.NODE_ENV = 'production'
  const siteConfig = await resolveConfig(root, 'build', 'production')
  const unlinkVue = linkVue()

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

  try {
    const { clientResult, serverResult, pageToHashMap } = await bundle(
      siteConfig,
      buildOptions
    )

    if (process.env.BUNDLE_ONLY) {
      return
    }

    const entryPath = path.join(siteConfig.tempDir, 'app.js')
    const { render } = await import(pathToFileURL(entryPath).toString())

    await task('rendering pages', async () => {
      const appChunk =
        clientResult &&
        (clientResult.output.find(
          (chunk) =>
            chunk.type === 'chunk' &&
            chunk.isEntry &&
            chunk.facadeModuleId?.endsWith('.js')
        ) as Rollup.OutputChunk)

      const cssChunk = (
        siteConfig.mpa ? serverResult : clientResult!
      ).output.find(
        (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
      ) as Rollup.OutputAsset

      const assets = (siteConfig.mpa ? serverResult : clientResult!).output
        .filter(
          (chunk) => chunk.type === 'asset' && !chunk.fileName.endsWith('.css')
        )
        .map((asset) => siteConfig.site.base + asset.fileName)

      // default theme special handling: inject font preload
      // custom themes will need to use `transformHead` to inject this
      const additionalHeadTags: HeadConfig[] = []
      const isDefaultTheme =
        clientResult &&
        clientResult.output.some(
          (chunk) =>
            chunk.type === 'chunk' &&
            chunk.name === 'theme' &&
            chunk.moduleIds.some((id) => id.includes('client/theme-default'))
        )

      const metadataScript = generateMetadataScript(pageToHashMap, siteConfig)

      if (isDefaultTheme) {
        const fontURL = assets.find((file) =>
          /inter-roman-latin\.\w+\.woff2/.test(file)
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

      await Promise.all(
        ['404.md', ...siteConfig.pages]
          .map((page) => siteConfig.rewrites.map[page] || page)
          .map((page) =>
            renderPage(
              render,
              siteConfig,
              page,
              clientResult,
              appChunk,
              cssChunk,
              assets,
              pageToHashMap,
              metadataScript,
              additionalHeadTags
            )
          )
      )
    })

    // emit page hash map for the case where a user session is open
    // when the site got redeployed (which invalidates current hash map)
    fs.writeJSONSync(
      path.join(siteConfig.outDir, 'hashmap.json'),
      pageToHashMap
    )
  } finally {
    unlinkVue()
    if (!process.env.DEBUG) await rimraf(siteConfig.tempDir)
  }

  await generateSitemap(siteConfig)
  await siteConfig.buildEnd?.(siteConfig)

  siteConfig.logger.info(
    `build complete in ${((Date.now() - start) / 1000).toFixed(2)}s.`
  )
}

function linkVue() {
  const root = packageDirectorySync()
  if (root) {
    const dest = path.resolve(root, 'node_modules/vue')
    // if user did not install vue by themselves, link VitePress' version
    if (!fs.existsSync(dest)) {
      const src = path.dirname(createRequire(import.meta.url).resolve('vue'))
      fs.ensureSymlinkSync(src, dest, 'junction')
      return () => {
        fs.unlinkSync(dest)
      }
    }
  }
  return () => {}
}

function generateMetadataScript(
  pageToHashMap: Record<string, string>,
  config: SiteConfig
) {
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

  if (!config.metaChunk) {
    return { html: `<script>${metadataContent}</script>`, inHead: false }
  }

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

  fs.ensureDirSync(path.dirname(resolvedMetadataFile))
  fs.writeFileSync(resolvedMetadataFile, metadataContent)

  return {
    html: `<script type="module" src="${metadataFileURL}"></script>`,
    inHead: true
  }
}
