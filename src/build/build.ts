import path from 'path'
import { promises as fs } from 'fs'
import { bundle } from './bundle'
import { BuildOptions as ViteBuildOptions } from 'vite'
import { resolveConfig } from '../config'
import { renderPage } from './render'
import { exists, copyDir } from '../utils/fs'

export type BuildOptions = Pick<
  ViteBuildOptions,
  'root' | 'rollupInputOptions' | 'rollupOutputOptions'
>

export async function build(buildOptions: BuildOptions = {}) {
  const siteConfig = await resolveConfig(buildOptions.root)
  try {
    const [clientResult] = await bundle(siteConfig, buildOptions)

    console.log('rendering pages...')
    for (const page of siteConfig.pages) {
      await renderPage(siteConfig, page, clientResult)
    }

    if (await exists(siteConfig.publicDir)) {
      console.log('copying public dir...')
      await copyDir(
        siteConfig.publicDir,
        path.join(siteConfig.outDir, 'public')
      )
    }
  } finally {
    await fs.rmdir(siteConfig.tempDir, { recursive: true })
  }
  console.log('done.')
}
