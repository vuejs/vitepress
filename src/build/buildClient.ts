import path from 'path'
import globby from 'globby'
import { promises as fs } from 'fs'
import { APP_PATH, createResolver } from '../utils/pathResolver'
import { build, BuildOptions } from 'vite'
import { resolveConfig } from '../resolveConfig'
import { Plugin } from 'rollup'
import { createMarkdownToVueRenderFn } from '../markdownToVue'

export async function buildClient(options: BuildOptions) {
  const root = options.root || process.cwd()
  const config = await resolveConfig(root)
  const resolver = createResolver(config.themePath)
  const markdownToVue = createMarkdownToVueRenderFn(root)

  const {
    resolvers = [],
    srcRoots = [],
    rollupInputOptions = {},
    rollupOutputOptions = {}
  } = options

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
      // generate facade module for .md files
      // and request virtual .md.vue file
      if (id.endsWith('.md')) {
        return (
          `import Comp, { __pageData } from "${id + '.vue'}"\n` +
          `export default Comp\n` +
          `export { __pageData }`
        )
      }
      // compile md into vue src for .md.vue virtual files
      if (id.endsWith('.md.vue')) {
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
        if (
          chunk.type === 'chunk' &&
          chunk.isEntry &&
          chunk.facadeModuleId &&
          chunk.facadeModuleId.endsWith('.md')
        ) {
          const relativePath = path.relative(root, chunk.facadeModuleId)
          chunk.fileName = relativePath + '.js'
        }
      }
    }
  }

  const pages = (
    await globby(['**.md'], { cwd: root, ignore: ['node_modules'] })
  ).map((file) => path.resolve(root, file))

  await build({
    ...options,
    cdn: false,
    resolvers: [resolver, ...resolvers],
    srcRoots: [APP_PATH, config.themePath, ...srcRoots],
    indexPath: path.resolve(APP_PATH, 'index.html'),
    rollupInputOptions: {
      ...rollupInputOptions,
      input: [path.resolve(APP_PATH, 'index.js'), ...pages],
      plugins: [VitePressPlugin, ...(rollupInputOptions.plugins || [])]
    },
    rollupOutputOptions: {
      dir: path.resolve(root, '.vitepress/dist'),
      ...rollupOutputOptions
    },
    debug: !!process.env.DEBUG
  })
}
