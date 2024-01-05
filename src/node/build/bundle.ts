import fs from 'fs-extra'
import path from 'path'
import { build, type BuildOptions, type PluginOption, type Rollup } from 'vite'
import type { SiteConfig } from '../config'
import { updateCurrentTask } from '../utils/task'
import { buildMPAClient } from './buildMPAClient'
import { registerWorkload, shouldUseParallel } from '../worker'
import resolveViteConfig from './viteConfig'
import { type WorkerContext } from './build'
import { createVitePressPlugin } from '../plugin'

const dispatchBundleWorkload = registerWorkload(
  'build:bundle',
  bundleWorkload,
  function (this: WorkerContext) {
    // To make contentLoader happy
    // @ts-ignore
    global.VITEPRESS_CONFIG = this.config
  }
)

async function bundleWorkload(
  this: WorkerContext,
  ssr: boolean,
  plugins: PluginOption[]
) {
  const config = await resolveViteConfig(ssr, {
    config: this.config,
    options: this.options,
    plugins
  })
  return build(config) as Promise<Rollup.RollupOutput>
}

async function bundleMPA(
  config: SiteConfig,
  serverResult: Rollup.RollupOutput,
  clientJSMap: Record<string, string>
) {
  updateCurrentTask(0, 1, 'bundling MPA')
  // in MPA mode, we need to copy over the non-js asset files from the
  // server build since there is no client-side build.
  await Promise.all(
    serverResult.output.map(async (chunk) => {
      if (!chunk.fileName.endsWith('.js')) {
        const tempPath = path.resolve(config.tempDir, chunk.fileName)
        const outPath = path.resolve(config.outDir, chunk.fileName)
        await fs.copy(tempPath, outPath)
      }
    })
  )
  // also copy over public dir
  const publicDir = path.resolve(config.srcDir, 'public')
  if (fs.existsSync(publicDir)) {
    await fs.copy(publicDir, config.outDir)
  }
  updateCurrentTask()
  // build <script client> bundle
  if (Object.keys(clientJSMap).length) {
    return buildMPAClient(clientJSMap, config)
  } else {
    return null
  }
}

// bundles the VitePress app for both client AND server.
export async function bundle(
  config: SiteConfig,
  options: BuildOptions
): Promise<{
  clientResult: Rollup.RollupOutput | null
  serverResult: Rollup.RollupOutput
  pageToHashMap: Record<string, string>
}> {
  const pageToHashMap = Object.create(null)
  const clientJSMap = Object.create(null)

  const [serverResult, clientResult] = await Promise.all(
    [true, false].map(async (ssr) => {
      if (!ssr && config.mpa) return null
      const plugins = await createVitePressPlugin(
        config,
        ssr,
        pageToHashMap,
        clientJSMap
      )
      return shouldUseParallel(config, 'bundle')
        ? dispatchBundleWorkload(ssr, plugins)
        : bundleWorkload.apply({ config, options }, [ssr, plugins])
    })
  )

  return {
    clientResult: config.mpa
      ? await bundleMPA(config, serverResult!, clientJSMap)
      : clientResult!,
    serverResult: serverResult!,
    pageToHashMap
  }
}
