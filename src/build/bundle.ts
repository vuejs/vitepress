import path from 'path'
import slash from 'slash'
import { promises as fs } from 'fs'
import { APP_PATH, createResolver } from '../utils/pathResolver'
import { build, BuildOptions as ViteBuildOptions, BuildResult } from 'vite'
import { BuildOptions } from './build'
import { SiteConfig } from '../config'
import { Plugin } from 'rollup'
import { createMarkdownToVueRenderFn } from '../markdownToVue'

// bundles the VitePress app for both client AND server.
export async function bundle(
  config: SiteConfig,
  options: BuildOptions
): Promise<BuildResult[]> {
  const root = config.root
  const resolver = createResolver(config.themeDir)
  const markdownToVue = createMarkdownToVueRenderFn(root)

  const { rollupInputOptions = {}, rollupOutputOptions = {} } = options

  const VitePressPlugin: Plugin = {
    name: 'vitepress',
    resolveId(id) {
      if (id.endsWith('.md.vue')) {
        return id
      }
    },
    async load(id) {
      if (id === '/@siteData') {
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
    generateBundle(_options, bundle) {
      // for each .md entry chunk, adjust its name to its correct path.
      for (const name in bundle) {
        const chunk = bundle[name]
        if (chunk.type === 'chunk') {
          if (
            chunk.isEntry &&
            chunk.facadeModuleId &&
            chunk.facadeModuleId.endsWith('.md')
          ) {
            // foo/bar.md -> _assets/foo_bar.md.js
            chunk.fileName = path.join(
              '_assets/',
              slash(path.relative(root, chunk.facadeModuleId)).replace(
                /\//g,
                '_'
              ) + '.js'
            )
          } else {
            chunk.fileName = path.join('_assets/', chunk.fileName)
          }
        }
      }
    }
  }

  // convert page files to absolute paths
  const pages = config.pages.map(file => path.resolve(root, file))

  // let rollup-plugin-vue compile .md files as well
  const rollupPluginVueOptions = {
    include: /\.(vue|md)$/
  }

  const sharedOptions: ViteBuildOptions = {
    ...options,
    cdn: false,
    silent: true,
    resolvers: [resolver],
    srcRoots: [APP_PATH, config.themeDir],
    cssFileName: '_assets/style.css',
    rollupPluginVueOptions,
    rollupInputOptions: {
      ...rollupInputOptions,
      input: [path.resolve(APP_PATH, 'index.js'), ...pages],
      plugins: [VitePressPlugin, ...(rollupInputOptions.plugins || [])]
    },
    rollupOutputOptions: {
      ...rollupOutputOptions,
      dir: config.outDir
    },
    minify: !process.env.DEBUG
  }

  console.log('building client bundle...')
  const clientResult = await build({
    ...sharedOptions,
    rollupOutputOptions: {
      ...rollupOutputOptions,
      dir: config.outDir
    }
  })

  console.log('building server bundle...')
  const serverResult = await build({
    ...sharedOptions,
    rollupPluginVueOptions: {
      ...rollupPluginVueOptions,
      target: 'node'
    },
    rollupInputOptions: {
      ...sharedOptions.rollupInputOptions,
      external: ['vue', '@vue/server-renderer']
    },
    rollupOutputOptions: {
      ...rollupOutputOptions,
      dir: config.tempDir,
      format: 'cjs',
      exports: 'named'
    },
    // server build doesn't need minification
    minify: false
  })

  return [clientResult, serverResult]
}
