import path from 'path'
import slash from 'slash'
import fs from 'fs-extra'
import { APP_PATH, createResolver, SITE_DATA_REQUEST_PATH } from '../resolver'
import { BuildOptions, ASSETS_DIR } from './build'
import { SiteConfig } from '../config'
import { Plugin, OutputAsset, OutputChunk } from 'rollup'
import { createMarkdownToVueRenderFn } from '../markdownToVue'
import {
  build,
  ssrBuild,
  BuildConfig as ViteBuildOptions,
  BuildResult
} from 'vite'

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
  const resolver = createResolver(config.themeDir)
  const markdownToVue = createMarkdownToVueRenderFn(root)

  let isClientBuild = true
  const pageToHashMap = Object.create(null)

  const VitePressPlugin: Plugin = {
    name: 'vitepress',
    resolveId(id) {
      if (id === SITE_DATA_REQUEST_PATH || id.endsWith('.md.vue')) {
        return id
      }
    },
    async load(id) {
      if (id === SITE_DATA_REQUEST_PATH) {
        return `export default ${JSON.stringify(JSON.stringify(config.site))}`
      }
      // compile md into vue src for .md.vue virtual files
      if (id.endsWith('.md')) {
        const filePath = id.replace(/\.vue$/, '')
        const content = await fs.readFile(filePath, 'utf-8')
        const lastUpdated = (await fs.stat(filePath)).mtimeMs
        const { vueSrc } = markdownToVue(content, filePath, lastUpdated)
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
        if (isPageChunk(chunk)) {
          // foo/bar.md -> foo_bar.md.js
          const hash = isClientBuild
            ? chunk.fileName.match(/\.(\w+)\.js$/)![1]
            : ``
          const pageName = slash(
            path.relative(root, chunk.facadeModuleId)
          ).replace(/\//g, '_')
          chunk.fileName = `${pageName}${hash ? `.${hash}` : ``}.js`

          if (isClientBuild) {
            // record page -> hash relations
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
  }

  const appEntry = path.resolve(APP_PATH, 'index.js')
  // convert page files to absolute paths
  const pages = config.pages.map((file) => path.resolve(root, file))

  // resolve options to pass to vite
  const { rollupInputOptions = {}, rollupOutputOptions = {} } = options
  const viteOptions: ViteBuildOptions = {
    ...options,
    base: config.site.base,
    resolvers: [resolver],
    outDir: config.outDir,
    assetsDir: ASSETS_DIR,
    // let rollup-plugin-vue compile .md files as well
    rollupPluginVueOptions: {
      include: /\.(vue|md)$/
    },
    rollupInputOptions: {
      ...rollupInputOptions,
      // use our custom input
      // this is a multi-entry build - every page is considered an entry chunk
      // the loading is done via filename conversion rules so that the
      // metadata doesn't need to be included in the main chunk.
      input: [appEntry, ...pages],
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

  console.log('building client bundle...')
  const clientResult = await build({
    ...viteOptions,
    rollupOutputOptions: {
      ...viteOptions.rollupOutputOptions,
      entryFileNames: `[name].[hash].js`
    }
  })

  console.log('building server bundle...')
  isClientBuild = false
  const serverResult = await ssrBuild({
    ...viteOptions,
    outDir: config.tempDir
  })

  return [clientResult, serverResult, pageToHashMap]
}
