import path from 'path'
import { APP_PATH, createResolver } from '../utils/pathResolver'
import { build, BuildOptions } from 'vite'
import { resolveConfig } from '../resolveConfig'
import { Plugin } from 'rollup'

export async function buildClient(options: BuildOptions) {
  const root = options.root || process.cwd()
  const config = await resolveConfig(root)
  const resolver = createResolver(config.themePath)

  const {
    resolvers = [],
    srcRoots = [],
    rollupInputOptions = {},
    rollupOutputOptions = {}
  } = options

  const VitePressPlugin: Plugin = {
    name: 'vitepress',
    load(id) {
      if (id === '/@siteData') {
        return `export default ${JSON.stringify(JSON.stringify(config.site))}`
      }
    }
  }

  await build({
    ...options,
    cdn: false,
    resolvers: [resolver, ...resolvers],
    srcRoots: [APP_PATH, config.themePath, ...srcRoots],
    indexPath: path.resolve(APP_PATH, 'index.html'),
    rollupInputOptions: {
      ...rollupInputOptions,
      input: path.resolve(APP_PATH, 'index.js'),
      plugins: [VitePressPlugin, ...(rollupInputOptions.plugins || [])]
    },
    rollupOutputOptions: {
      dir: path.resolve(root, '.vitepress/dist'),
      ...rollupOutputOptions
    },
    debug: !!process.env.DEBUG
  })

  // console.log(output)
  // console.log(css)
}
