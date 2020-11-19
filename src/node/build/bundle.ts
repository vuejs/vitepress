import path from 'path'
import slash from 'slash'
import fs from 'fs-extra'
import { APP_PATH, createResolver, SITE_DATA_REQUEST_PATH } from '../resolver'
import { BuildOptions } from './build'
import { resolveUserConfig, SiteConfig } from '../config'
import { Plugin, OutputAsset, OutputChunk } from 'rollup'
import { createMarkdownToVueRenderFn } from '../markdownToVue'
import {
  build,
  ssrBuild,
  BuildConfig as ViteBuildOptions,
  BuildResult
} from 'vite'
import ora from 'ora'

export const okMark = '\x1b[32m✓\x1b[0m'
export const failMark = '\x1b[31m✖\x1b[0m'

const hashRE = /\.(\w+)\.js$/
const staticInjectMarkerRE = /\b(const _hoisted_\d+ = \/\*#__PURE__\*\/createStaticVNode)\("(.*)", (\d+)\)/g
const staticStripRE = /__VP_STATIC_START__.*?__VP_STATIC_END__/g
const staticRestoreRE = /__VP_STATIC_(START|END)__/g

const isPageChunk = (
  chunk: OutputAsset | OutputChunk
): chunk is OutputChunk & { facadeModuleId: string } =>
  !!(
    chunk.type === 'chunk' &&
    chunk.isEntry &&
    chunk.facadeModuleId &&
    chunk.facadeModuleId.endsWith('.md')
  )

// bundles the VitePress app for both client AND server.
export async function bundle(
  config: SiteConfig,
  options: BuildOptions
): Promise<[BuildResult, BuildResult, Record<string, string>]> {
  const root = config.root
  const userConfig = await resolveUserConfig(root)
  const resolver = createResolver(config.themeDir, userConfig)
  const markdownToVue = createMarkdownToVueRenderFn(root, userConfig.markdown)

  let isClientBuild = true
  const pageToHashMap = Object.create(null)

  const VitePressPlugin: Plugin = {
    name: 'vitepress',
    resolveId(id) {
      if (id === SITE_DATA_REQUEST_PATH) {
        return id
      }
    },

    async load(id) {
      if (id === SITE_DATA_REQUEST_PATH) {
        return `export default ${JSON.stringify(JSON.stringify(config.site))}`
      }
      // compile md into vue src
      if (id.endsWith('.md')) {
        const content = await fs.readFile(id, 'utf-8')
        // TODO use git timestamp
        const lastUpdated = (await fs.stat(id)).mtimeMs
        const { vueSrc } = markdownToVue(content, id, lastUpdated)
        return vueSrc
      }
    },

    renderChunk(code, chunk) {
      if (isClientBuild && isPageChunk(chunk as OutputChunk)) {
        // For each page chunk, inject marker for start/end of static strings.
        // we do this here because in generateBundle the chunks would have been
        // minified and we won't be able to safely locate the strings.
        // Using a regexp relies on specific output from Vue compiler core,
        // which is a reasonable trade-off considering the massive perf win over
        // a full AST parse.
        code = code.replace(
          staticInjectMarkerRE,
          '$1("__VP_STATIC_START__$2__VP_STATIC_END__", $3)'
        )
        return code
      }
      return null
    },

    generateBundle(_options, bundle) {
      // for each .md entry chunk, adjust its name to its correct path.
      for (const name in bundle) {
        const chunk = bundle[name]
        if (isPageChunk(chunk) && isClientBuild) {
          // record page -> hash relations
          const hash = chunk.fileName.match(hashRE)![1]
          const pageName = chunk.fileName.replace(hashRE, '')
          pageToHashMap[pageName] = hash

          // inject another chunk with the content stripped
          bundle[name + '-lean'] = {
            ...chunk,
            fileName: chunk.fileName.replace(/\.js$/, '.lean.js'),
            code: chunk.code.replace(staticStripRE, ``)
          }
          // remove static markers from orginal code
          chunk.code = chunk.code.replace(staticRestoreRE, '')
        }
      }
    }
  }

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
  const { rollupInputOptions = {}, rollupOutputOptions = {} } = options
  const viteOptions: Partial<ViteBuildOptions> = {
    ...options,
    base: config.site.base,
    resolvers: [resolver],
    outDir: config.outDir,
    // let rollup-plugin-vue compile .md files as well
    rollupPluginVueOptions: {
      include: /\.(vue|md)$/
    },
    rollupInputOptions: {
      ...rollupInputOptions,
      input,
      // important so that each page chunk and the index export things for each
      // other
      preserveEntrySignatures: 'allow-extension',
      plugins: [VitePressPlugin, ...(rollupInputOptions.plugins || [])]
    },
    rollupOutputOptions: {
      ...rollupOutputOptions,
      chunkFileNames: `common-[hash].js`
    },
    silent: !process.env.DEBUG,
    minify: !process.env.DEBUG
  }

  let clientResult, serverResult

  const spinner = ora()
  spinner.start('building client bundle...')
  try {
    clientResult = await build(viteOptions)
  } catch (e) {
    spinner.stopAndPersist({
      symbol: failMark
    })
    throw e
  }
  spinner.stopAndPersist({
    symbol: okMark
  })

  spinner.start('building server bundle...')
  isClientBuild = false
  try {
    serverResult = await ssrBuild({
      ...viteOptions,
      outDir: config.tempDir
    })
  } catch (e) {
    spinner.stopAndPersist({
      symbol: failMark
    })
    throw e
  }
  spinner.stopAndPersist({
    symbol: okMark
  })

  return [clientResult[0], serverResult[0], pageToHashMap]
}
