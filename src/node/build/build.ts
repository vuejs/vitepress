import { getIconsCSS } from '@iconify/utils'
import fs from 'node:fs'
import { mkdir, rm, symlink, unlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { packageDirectory } from 'package-directory'
import type { BuildOptions } from 'vite'
import { resolveConfig, type SiteConfig } from '../config'
import type { PageMeta } from '../plugin'
import type { Awaitable } from '../shared'
import { cacheAllGitTimestamps } from '../utils/getGitTimestamp'
import { task } from '../utils/task'
import { clearBuildCaches, disposeBuildCaches } from './cache'
import { bundle } from './bundle'
import { generateSitemap } from './generateSitemap'
import { prepareRenderInputs } from './render/metadata'
import { getRenderer, renderPages } from './render/page'
import { buildWithBatchedSsr } from './ssr/coordinator'
import {
  createRenderQueue,
  resolveSsrBatchOptions,
  validateBuildConcurrency
} from './ssr/options'

const require = createRequire(import.meta.url)

type VitePressBuildOptions = BuildOptions & {
  base?: string
  mpa?: string
  onAfterConfigResolve?: (siteConfig: SiteConfig) => Awaitable<void>
}

export async function build(
  root?: string,
  buildOptions: VitePressBuildOptions = {}
): Promise<void> {
  const start = performance.now()
  process.env.NODE_ENV = 'production'
  const siteConfig = await resolveConfig(root, 'build', 'production')

  await buildOptions.onAfterConfigResolve?.(siteConfig)
  delete buildOptions.onAfterConfigResolve

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

  validateBuildConcurrency(siteConfig.buildConcurrency)
  const batchOptions = resolveSsrBatchOptions(siteConfig)
  if (siteConfig.mpa && batchOptions) {
    throw new Error('ssrBuildBatchSize is not compatible with MPA mode.')
  }
  if (process.env.BUNDLE_ONLY && batchOptions) {
    throw new Error(
      'BUNDLE_ONLY is not compatible with ssrBuildBatchSize because the shared runtime and page artifacts are consumed by the batched renderer.'
    )
  }

  if (siteConfig.lastUpdated) {
    await task('loading last-updated data', () =>
      cacheAllGitTimestamps(siteConfig.srcDir, ['*.md'], true)
    )
  }

  const unlinkVue = await linkVue()
  const pageMetaMap = Object.create(null) as Record<string, PageMeta>

  try {
    try {
      const usedIcons = new Set<string>()
      const pageToHashMap = batchOptions
        ? await buildWithBatchedSsr(
            siteConfig,
            buildOptions,
            pageMetaMap,
            usedIcons,
            batchOptions
          )
        : await buildStandard(siteConfig, buildOptions, pageMetaMap, usedIcons)

      if (!pageToHashMap) return
      await writeBuildMetadata(siteConfig, pageToHashMap, usedIcons)
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
      await task('generating sitemap', () =>
        generateSitemap(siteConfig, pageMetaMap)
      )
    }
    await siteConfig.buildEnd?.(siteConfig)
    siteConfig.logger.info(
      `build complete in ${((performance.now() - start) / 1000).toFixed(2)}s.`
    )
  } finally {
    disposeBuildCaches()
  }
}

async function buildStandard(
  siteConfig: SiteConfig,
  buildOptions: BuildOptions,
  pageMetaMap: Record<string, PageMeta>,
  usedIcons: Set<string>
): Promise<Record<string, string> | undefined> {
  const result = await task('building client + server bundles', () =>
    bundle(siteConfig, buildOptions, pageMetaMap, {
      mode: 'full',
      vitePressPluginOptions: { skipGitScan: true }
    })
  )
  if (process.env.BUNDLE_ONLY) return

  const inputs = await prepareRenderInputs(
    siteConfig,
    result.clientResult,
    result.serverResult,
    result.pageToHashMap
  )
  clearBuildCaches()
  const render = await getRenderer(siteConfig.tempDir)
  await task('rendering pages', () =>
    renderPages(
      render,
      siteConfig,
      siteConfig.tempDir,
      createRenderQueue(siteConfig.pages),
      inputs.renderMetadata,
      result.pageToHashMap,
      inputs.metadataScript,
      inputs.additionalHeadTags,
      usedIcons
    )
  )
  return result.pageToHashMap
}

async function writeBuildMetadata(
  siteConfig: SiteConfig,
  pageToHashMap: Record<string, string>,
  usedIcons: Set<string>
): Promise<void> {
  const icons = require('@iconify-json/simple-icons/icons.json')
  const iconsCss = getIconsCSS(icons, Array.from(usedIcons).sort(), {
    iconSelector: '.vpi-social-{name}',
    commonSelector: '.vpi-social',
    varName: 'icon',
    format: process.env.DEBUG ? 'expanded' : 'compressed',
    mode: 'mask'
  }).replace(/[^]*?}\n*/, '')

  await Promise.all([
    writeFile(path.join(siteConfig.outDir, 'vp-icons.css'), iconsCss),
    writeFile(
      path.join(siteConfig.outDir, 'hashmap.json'),
      JSON.stringify(pageToHashMap)
    )
  ])
}

async function linkVue(): Promise<() => Promise<void>> {
  const root = await packageDirectory()
  if (root) {
    const dest = path.resolve(root, 'node_modules/vue')
    if (!fs.existsSync(dest)) {
      const src = path.dirname(createRequire(import.meta.url).resolve('vue'))
      await mkdir(path.dirname(dest), { recursive: true })
      await symlink(src, dest, 'junction')
      return () => unlink(dest)
    }
  }
  return async () => {}
}
