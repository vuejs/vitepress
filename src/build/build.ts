import { promises as fs } from 'fs'
import { bundle } from './bundle'
import { BuildOptions as ViteBuildOptions } from 'vite'
import { resolveConfig } from '../config'
import { renderPage } from './render'

export type BuildOptions = Pick<
  ViteBuildOptions,
  'root' | 'rollupInputOptions' | 'rollupOutputOptions'
>

export const ASSETS_DIR = '_assets/'

export async function build(buildOptions: BuildOptions = {}) {
  const siteConfig = await resolveConfig(buildOptions.root)
  try {
    const [clientResult] = await bundle(siteConfig, buildOptions)
    console.log('rendering pages...')
    for (const page of siteConfig.pages) {
      await renderPage(siteConfig, page, clientResult)
    }
  } finally {
    await fs.rmdir(siteConfig.tempDir, { recursive: true })
  }
  console.log('done.')
}
