import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'
import { BuildOptions } from 'vite'
import { OutputChunk, OutputAsset } from 'rollup'
import { resolveConfig } from '../config'
import { renderPage } from './render'
import { bundle, okMark, failMark } from './bundle'

export async function build(
  root: string,
  buildOptions: BuildOptions & { mpa?: string } = {}
) {
  const start = Date.now()

  process.env.NODE_ENV = 'production'
  const siteConfig = await resolveConfig(root, 'build', 'production')

  if (buildOptions.mpa) {
    siteConfig.mpa = true
    delete buildOptions.mpa
  }

  try {
    const { clientResult, serverResult, pageToHashMap } = await bundle(
      siteConfig,
      buildOptions
    )

    const spinner = ora()
    spinner.start('rendering pages...')

    try {
      const appChunk =
        clientResult &&
        (clientResult.output.find(
          (chunk) => chunk.type === 'chunk' && chunk.isEntry
        ) as OutputChunk)

      const cssChunk = (
        siteConfig.mpa ? serverResult : clientResult
      ).output.find(
        (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
      ) as OutputAsset

      // We embed the hash map string into each page directly so that it doesn't
      // alter the main chunk's hash on every build. It's also embedded as a
      // string and JSON.parsed from the client because it's faster than embedding
      // as JS object literal.
      const hashMapString = JSON.stringify(JSON.stringify(pageToHashMap))

      for (const page of siteConfig.pages) {
        await renderPage(
          siteConfig,
          page,
          clientResult,
          appChunk,
          cssChunk,
          pageToHashMap,
          hashMapString
        )
      }
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
    await fs.remove(siteConfig.tempDir)
  }

  console.log(`build complete in ${((Date.now() - start) / 1000).toFixed(2)}s.`)
}
