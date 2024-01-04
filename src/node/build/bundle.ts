import fs from 'fs-extra'
import path from 'path'
import { build, type BuildOptions, type Rollup } from 'vite'
import type { SiteConfig } from '../config'
import { updateCurrentTask } from '../utils/task'
import { buildMPAClient } from './buildMPAClient'
import { registerWorkload } from '../worker'
import resolveViteConfig from './viteConfig'
import { type WorkerContext } from './build'

const dispatchBundleWorkload = registerWorkload(
  'build:bundle',
  bundleWorkload,
  function (this: WorkerContext) {
    // To make contentLoader happy
    // @ts-ignore
    global.VITEPRESS_CONFIG = this.config
  }
)

async function bundleWorkload(this: WorkerContext, ssr: boolean) {
  const pageToHashMap = Object.create(null) as Record<string, string>
  const clientJSMap = Object.create(null) as Record<string, string>
  const result = (await build(
    await resolveViteConfig(ssr, {
      config: this.config,
      options: this.options,
      pageToHashMap,
      clientJSMap
    })
  )) as Rollup.RollupOutput
  return { result, pageToHashMap, clientJSMap }
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

  const [server, client] = await Promise.all(
    config.parallel
      ? [
          dispatchBundleWorkload(true),
          config.mpa ? null : dispatchBundleWorkload(false)
        ]
      : [
          bundleWorkload.apply({ config, options }, [true]),
          config.mpa ? null : bundleWorkload.apply({ config, options }, [false])
        ]
  )

  // Update maps
  Object.assign(pageToHashMap, server.pageToHashMap, client?.pageToHashMap)
  Object.assign(clientJSMap, server.clientJSMap, client?.clientJSMap)

  return {
    clientResult: config.mpa
      ? await bundleMPA(config, server.result, clientJSMap)
      : client?.result!,
    serverResult: server.result,
    pageToHashMap
  }
}
