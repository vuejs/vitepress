import ora from 'ora'
import path from 'path'
import slash from 'slash'
import { APP_PATH } from '../alias'
import { SiteConfig } from '../config'
import { RollupOutput, ExternalOption } from 'rollup'
import { build, BuildOptions, UserConfig as ViteUserConfig } from 'vite'
import { createVitePressPlugin } from '../plugin'

export const okMark = '\x1b[32m✓\x1b[0m'
export const failMark = '\x1b[31m✖\x1b[0m'

// bundles the VitePress app for both client AND server.
export async function bundle(
  config: SiteConfig,
  options: BuildOptions
): Promise<[RollupOutput, RollupOutput, Record<string, string>]> {
  const root = config.root
  const pageToHashMap = Object.create(null)

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
    input[slash(file).replace(/\//g, '_')] = path.resolve(root, file)
  })

  // resolve options to pass to vite
  const { rollupOptions } = options

  const resolveViteConfig = (ssr: boolean): ViteUserConfig => ({
    logLevel: 'warn',
    plugins: createVitePressPlugin(root, config, ssr, pageToHashMap),
    build: {
      ...options,
      base: config.site.base,
      outDir: ssr ? config.tempDir : config.outDir,
      cssCodeSplit: !ssr,
      rollupOptions: {
        ...rollupOptions,
        input,
        external: ssr
          ? resolveExternal(rollupOptions?.external)
          : rollupOptions?.external,
        // important so that each page chunk and the index export things for each
        // other
        preserveEntrySignatures: 'allow-extension',
        output: {
          ...rollupOptions?.output,
          ...(ssr
            ? {
                format: 'cjs',
                exports: 'named',
                entryFileNames: '[name].js'
              }
            : {
                chunkFileNames(chunk): string {
                  if (!chunk.isEntry && /runtime/.test(chunk.name)) {
                    return `assets/framework.[hash].js`
                  }
                  return `assets/[name].[hash].js`
                }
              })
        }
      },
      minify: ssr ? false : !process.env.DEBUG
    }
  })

  let clientResult: RollupOutput
  let serverResult: RollupOutput

  const spinner = ora()
  spinner.start('building client + server bundles...')
  try {
    ;[clientResult, serverResult] = await (Promise.all([
      build(resolveViteConfig(false)),
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

  return [clientResult, serverResult, pageToHashMap]
}

function resolveExternal(
  userExternal: ExternalOption | undefined
): ExternalOption {
  const required = ['vue', /^@vue\//]
  if (!userExternal) {
    return required
  }
  if (Array.isArray(userExternal)) {
    return [...required, ...userExternal]
  } else if (typeof userExternal === 'function') {
    return (src, importer, isResolved) => {
      if (src === 'vue' || /^@vue\//.test(src)) {
        return true
      }
      return userExternal(src, importer, isResolved)
    }
  } else {
    return [...required, userExternal]
  }
}
