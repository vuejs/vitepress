import ora from 'ora'
import path from 'path'
import fs from 'fs-extra'
import { slash } from '../utils/slash'
import { APP_PATH } from '../alias'
import { SiteConfig } from '../config'
import { RollupOutput } from 'rollup'
import { build, BuildOptions, UserConfig as ViteUserConfig } from 'vite'
import { createVitePressPlugin } from '../plugin'
import { buildMPAClient } from './buildMPAClient'

export const okMark = '\x1b[32m✓\x1b[0m'
export const failMark = '\x1b[31m✖\x1b[0m'

// bundles the VitePress app for both client AND server.
export async function bundle(
  config: SiteConfig,
  options: BuildOptions
): Promise<{
  clientResult: RollupOutput
  serverResult: RollupOutput
  pageToHashMap: Record<string, string>
}> {
  const { root, srcDir } = config
  const pageToHashMap = Object.create(null)
  const clientJSMap = Object.create(null)

  // define custom rollup input
  // this is a multi-entry build - every page is considered an entry chunk
  // the loading is done via filename conversion rules so that the
  // metadata doesn't need to be included in the main chunk.
  const input: Record<string, string> = {
    app: path.resolve(APP_PATH, 'index.js')
  }
  config.pages.forEach((file) => {
    // page filename conversion
    // foo/bar.md -> foo_bar.md
    input[slash(file).replace(/\//g, '_')] = path.resolve(srcDir, file)
  })

  // resolve options to pass to vite
  const { rollupOptions } = options

  const resolveViteConfig = (ssr: boolean): ViteUserConfig => ({
    root: srcDir,
    base: config.site.base,
    logLevel: 'warn',
    plugins: createVitePressPlugin(
      root,
      config,
      ssr,
      pageToHashMap,
      clientJSMap
    ),
    // @ts-ignore
    ssr: {
      noExternal: ['vitepress']
    },
    build: {
      ...options,
      emptyOutDir: true,
      ssr,
      outDir: ssr ? config.tempDir : config.outDir,
      cssCodeSplit: false,
      rollupOptions: {
        ...rollupOptions,
        input,
        // important so that each page chunk and the index export things for each
        // other
        preserveEntrySignatures: 'allow-extension',
        output: {
          ...rollupOptions?.output,
          ...(ssr
            ? {}
            : {
                chunkFileNames(chunk): string {
                  if (!chunk.isEntry && /runtime/.test(chunk.name)) {
                    return `assets/framework.[hash].js`
                  }
                  return adComponentRE.test(chunk.name)
                    ? `assets/ui-custom.[hash].js`
                    : `assets/[name].[hash].js`
                }
              })
        }
      },
      // minify with esbuild in MPA mode (for CSS)
      minify: ssr ? (config.mpa ? 'esbuild' : false) : !process.env.DEBUG
    }
  })

  let clientResult: RollupOutput
  let serverResult: RollupOutput

  const spinner = ora()
  spinner.start('building client + server bundles...')
  try {
    ;[clientResult, serverResult] = await (Promise.all([
      config.mpa ? null : build(resolveViteConfig(false)),
      build(resolveViteConfig(true))
    ]) as Promise<[RollupOutput, RollupOutput]>)
  } catch (e) {
    spinner.stopAndPersist({
      symbol: failMark
    })
    throw e
  }
  spinner.stopAndPersist({
    symbol: okMark
  })

  if (config.mpa) {
    // in MPA mode, we need to copy over the non-js asset files from the
    // server build since there is no client-side build.
    for (const chunk of serverResult.output) {
      if (!chunk.fileName.endsWith('.js')) {
        const tempPath = path.resolve(config.tempDir, chunk.fileName)
        const outPath = path.resolve(config.outDir, chunk.fileName)
        await fs.copy(tempPath, outPath)
      }
    }
    // also copy over public dir
    const publicDir = path.resolve(config.srcDir, 'public')
    if (fs.existsSync(publicDir)) {
      await fs.copy(publicDir, config.outDir)
    }
    // build <script client> bundle
    if (Object.keys(clientJSMap).length) {
      clientResult = (await buildMPAClient(clientJSMap, config)) as RollupOutput
    }
  }

  return { clientResult, serverResult, pageToHashMap }
}

const adComponentRE = /(?:Carbon|BuySell)Ads/
