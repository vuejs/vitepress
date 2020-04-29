import { promises as fs } from 'fs'
import { bundle } from './bundle'
import { BuildOptions as ViteBuildOptions } from 'vite'
import { resolveConfig } from '../config'
import { renderPage } from './render'

export type BuildOptions = Pick<
  ViteBuildOptions,
  'root' | 'rollupInputOptions' | 'rollupOutputOptions'
>

export async function build(buildOptions: BuildOptions = {}) {
  const siteConfig = await resolveConfig(buildOptions.root)
  try {
    const result = await bundle(siteConfig, buildOptions)

    console.log('rendering pages...')
    for (const page of siteConfig.pages) {
      await renderPage(siteConfig, page, result)
    }
  } finally {
    await fs.rmdir(siteConfig.tempDir, { recursive: true })
    console.log('done.')
  }
}
