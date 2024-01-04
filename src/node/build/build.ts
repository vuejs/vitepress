import { createHash } from 'crypto'
import fs from 'fs-extra'
import { createRequire } from 'module'
import pMap from 'p-map'
import path from 'path'
import { packageDirectorySync } from 'pkg-dir'
import { rimraf } from 'rimraf'
import { pathToFileURL } from 'url'
import type { BuildOptions, Rollup } from 'vite'
import { resolveConfig, type SiteConfig } from '../config'
import { clearCache } from '../markdownToVue'
import { slash, type HeadConfig, type SSGContext } from '../shared'
import { deserializeFunctions, serializeFunctions } from '../utils/fnSerialize'
import { task } from '../utils/task'
import { bundle } from './bundle'
import { generateSitemap } from './generateSitemap'
import { renderPage, type RenderPageContext } from './render'
import humanizeDuration from 'humanize-duration'
import { launchWorkers, waitWorkers } from '../worker'
import { registerWorkload, updateContext } from '../worker'
import { createMarkdownRenderer } from '../markdown/markdown'
import type { DefaultTheme } from '../shared'

type RenderFn = (path: string) => Promise<SSGContext>

// Worker: workload functions will be called with `this` context
export interface WorkerContext {
  config: SiteConfig
  options: BuildOptions
}

// Worker proxy (worker thread)
const dispatchRenderPageWork = registerWorkload(
  'build:render-page',
  function (page: string) {
    return renderPage(this.render, page, this)
  },
  async function init(
    this: WorkerContext &
      RenderPageContext & { render: RenderFn; renderEntry: string }
  ) {
    this.render = (await import(this.renderEntry)).render as RenderFn
  }
)

export async function build(
  root?: string,
  buildOptions: BuildOptions & { base?: string; mpa?: string } = {}
) {
  const timeStart = performance.now()

  process.env.NODE_ENV = 'production'
  const siteConfig = await resolveConfig(root, 'build', 'production')
  const unlinkVue = linkVue()

  if (siteConfig.parallel) {
    // Dirty fix: md.render() has side effects on env.
    // When user provides a custom render function, it will be invoked in the
    // main thread, but md.render will be called in the worker thread. The side
    // effects on env will be lost. So we need to make _render a curry function,
    // and use `md` provided in the main thread
    const config = siteConfig as SiteConfig<DefaultTheme.Config>
    const search = config.site?.themeConfig?.search
    if (search?.provider === 'local' && search?.options?._render) {
      const md = await createMarkdownRenderer(
        config.srcDir,
        config.markdown,
        config.site.base,
        config.logger
      )
      const _render = search.options._render
      search.options._render = (src, env, _) => _render(src, env, md)
    }

    await launchWorkers(siteConfig.concurrency, {
      config: siteConfig,
      options: buildOptions
    })
  }

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
    const { clientResult, serverResult, pageToHashMap } = await task(
      'building client + server bundles',
      () => bundle(siteConfig, buildOptions)
    )

    if (process.env.BUNDLE_ONLY) {
      return
    }

    await task('rendering pages', async (updateProgress) => {
      const renderEntry =
        pathToFileURL(path.join(siteConfig.tempDir, 'app.js')).toString() +
        '?t=' +
        Date.now()

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

      const context: RenderPageContext = {
        config: siteConfig,
        result: clientResult,
        appChunk,
        cssChunk,
        assets,
        pageToHashMap,
        metadataScript,
        additionalHeadTags
      }

      let task: (page: string) => Promise<void>

      if (siteConfig.parallel) {
        const { config, ...additionalContext } = context
        await updateContext({ renderEntry, ...additionalContext })
        task = (page) => dispatchRenderPageWork(page)
      } else {
        const { render } = await import(renderEntry)
        task = (page) => renderPage(render, page, context)
      }

      const pages = ['404.md', ...siteConfig.pages]
      let count_done = 0
      await pMap(
        pages,
        (page) => task(page).then(updateProgress(++count_done, pages.length)),
        {
          concurrency: siteConfig.concurrency
        }
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
  clearCache()

  if (siteConfig.parallel) await waitWorkers('build finish')

  const timeEnd = performance.now()
  const duration = humanizeDuration(timeEnd - timeStart, {
    maxDecimalPoints: 2
  })
  siteConfig.logger.info(`build complete in ${duration}.`)
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
