import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'
import type { BuildOptions } from 'vite'
import type { OutputChunk, OutputAsset } from 'rollup'
import { resolveConfig } from '../config'
import { renderPage } from './render'
import { bundle, okMark, failMark } from './bundle'
import { createRequire } from 'module'
import { pathToFileURL } from 'url'
import { packageDirectorySync } from 'pkg-dir'
import { serializeFunctions } from '../utils/fnSerialize'
import type { HeadConfig } from '../shared'

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

  try {
    const { clientResult, serverResult, pageToHashMap } = await bundle(
      siteConfig,
      buildOptions
    )

    const entryPath = path.join(siteConfig.tempDir, 'app.js')
    const { render } = await import(pathToFileURL(entryPath).toString())

    const spinner = ora()
    spinner.start('rendering pages...')

    try {
      const appChunk =
        clientResult &&
        (clientResult.output.find(
          (chunk) =>
            chunk.type === 'chunk' &&
            chunk.isEntry &&
            chunk.facadeModuleId?.endsWith('.js')
        ) as OutputChunk)

      const cssChunk = (
        siteConfig.mpa ? serverResult : clientResult
      ).output.find(
        (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
      ) as OutputAsset

      const assets = (siteConfig.mpa ? serverResult : clientResult).output
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

      // We embed the hash map and site config strings into each page directly
      // so that it doesn't alter the main chunk's hash on every build.
      // It's also embedded as a string and JSON.parsed from the client because
      // it's faster than embedding as JS object literal.
      const hashMapString = JSON.stringify(JSON.stringify(pageToHashMap))
      const siteDataString = JSON.stringify(
        JSON.stringify(serializeFunctions({ ...siteConfig.site, head: [] }))
      )

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
              hashMapString,
              siteDataString,
              additionalHeadTags
            )
          )
      )
    } catch (e) {
      spinner.stopAndPersist({
        symbol: failMark
      })
      throw e
    }
    spinner.stopAndPersist({
      symbol: okMark
    })

    // emit page hash map for the case where a user session is open
    // when the site got redeployed (which invalidates current hash map)
    fs.writeJSONSync(
      path.join(siteConfig.outDir, 'hashmap.json'),
      pageToHashMap
    )
  } finally {
    unlinkVue()
    if (!process.env.DEBUG)
      fs.rmSync(siteConfig.tempDir, { recursive: true, force: true })
  }

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
