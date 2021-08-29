import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import globby from 'globby'
import { AliasOptions, UserConfig as ViteConfig } from 'vite'
import { Options as VuePluginOptions } from '@vitejs/plugin-vue'
import {
  SiteData,
  HeadConfig,
  LocaleConfig,
  createLangDictionary
} from './shared'
import { resolveAliases, APP_PATH, DEFAULT_THEME_PATH } from './alias'
import { MarkdownOptions } from './markdown/markdown'
import { build } from 'esbuild'

export { resolveSiteDataByRoute } from './shared'

const debug = require('debug')('vitepress:config')

export interface UserConfig<ThemeConfig = any> {
  lang?: string
  base?: string
  title?: string
  description?: string
  head?: HeadConfig[]
  themeConfig?: ThemeConfig
  locales?: Record<string, LocaleConfig>
  markdown?: MarkdownOptions
  /**
   * Opitons to pass on to @vitejs/plugin-vue
   */
  vue?: VuePluginOptions
  /**
   * Vite config
   */
  vite?: ViteConfig
  customData?: any

  srcDir?: string
  srcExclude?: string[]

  /**
   * @deprecated use `srcExclude` instead
   */
  exclude?: string[]
  /**
   * @deprecated use `vue` instead
   */
  vueOptions?: VuePluginOptions
}

export interface SiteConfig<ThemeConfig = any> {
  root: string
  srcDir: string
  site: SiteData<ThemeConfig>
  configPath: string
  themeDir: string
  outDir: string
  tempDir: string
  alias: AliasOptions
  pages: string[]
  markdown: MarkdownOptions | undefined
  vue: VuePluginOptions | undefined
  vite: ViteConfig | undefined
}

const resolve = (root: string, file: string) =>
  path.resolve(root, `.vitepress`, file)

export async function resolveConfig(
  root: string = process.cwd()
): Promise<SiteConfig> {
  const { configPath, userConfig } = await resolveUserConfig(root)

  if (userConfig.vueOptions) {
    console.warn(
      chalk.yellow(`[vitepress] "vueOptions" option has been renamed to "vue".`)
    )
  }
  if (userConfig.exclude) {
    console.warn(
      chalk.yellow(
        `[vitepress] "exclude" option has been renamed to "ssrExclude".`
      )
    )
  }

  const site = await resolveSiteData(root, userConfig)

  const srcDir = path.resolve(root, userConfig.srcDir || '.')

  // resolve theme path
  const userThemeDir = resolve(root, 'theme')
  const themeDir = (await fs.pathExists(userThemeDir))
    ? userThemeDir
    : DEFAULT_THEME_PATH

  const config: SiteConfig = {
    root,
    srcDir,
    site,
    themeDir,
    pages: await globby(['**.md'], {
      cwd: srcDir,
      ignore: ['**/node_modules', ...(userConfig.srcExclude || [])]
    }),
    configPath: configPath,
    outDir: resolve(root, 'dist'),
    tempDir: path.resolve(APP_PATH, 'temp'),
    markdown: userConfig.markdown,
    alias: resolveAliases(themeDir),
    vue: userConfig.vue,
    vite: userConfig.vite
  }

  return config
}

/**
 * load user config
 * @param root
 * @param configFile
 * @returns
 */
export async function resolveUserConfig(
  root: string,
  configFile?: string
): Promise<{
  configPath: string
  userConfig: UserConfig
}> {
  const start = Date.now()

  let configPath: string | undefined
  let isTS = false

  if (configFile) {
    configPath = resolve(root, configFile)
    isTS = configFile.endsWith('.ts')
  } else {
    const jsConfigPath = resolve(root, 'config.js')
    if (fs.existsSync(jsConfigPath)) {
      configPath = jsConfigPath
    }

    if (!configPath) {
      const tsConfigPath = resolve(root, 'config.ts')
      if (fs.existsSync(tsConfigPath)) {
        configPath = tsConfigPath
        isTS = true
      }
    }
  }

  if (!configPath) {
    debug(`no config file found.`)
    return {
      configPath: '',
      userConfig: {}
    }
  }

  try {
    let userConfig: UserConfig | (() => UserConfig) | undefined

    if (!userConfig && !isTS) {
      try {
        // always delete cache first before loading config
        delete require.cache[configPath]
        userConfig = configPath ? require(configPath) : {}
        debug(`loaded config at ${chalk.yellow(configPath)}`)
      } catch (e) {
        const ignored = new RegExp(
          [
            `Cannot use import statement`,
            `Must use import to load ES Module`,
            `Unexpected token`,
            `Unexpected identifier`
          ].join('|')
        )
        if (!ignored.test(e.message)) {
          throw e
        }
      }
    }

    if (!userConfig) {
      const bundled = await bundleConfigFile(configPath)
      userConfig = await loadConfigFromBundledFile(configPath, bundled.code)
      debug(`bundled config file loaded in ${Date.now() - start}ms`)
    }

    const config = typeof userConfig === 'function' ? userConfig() : userConfig
    return {
      configPath,
      userConfig: config
    }
  } catch (e) {
    console.error(chalk.red(`failed to load config from ${configPath}`), {
      error: e
    })
    throw e
  }
}

export async function resolveSiteData(
  root: string,
  userConfig?: UserConfig
): Promise<SiteData> {
  userConfig = userConfig || (await (await resolveUserConfig(root)).userConfig)
  return {
    lang: userConfig.lang || 'en-US',
    title: userConfig.title || 'VitePress',
    description: userConfig.description || 'A VitePress site',
    base: userConfig.base ? userConfig.base.replace(/([^/])$/, '$1/') : '/',
    head: userConfig.head || [],
    themeConfig: userConfig.themeConfig || {},
    locales: userConfig.locales || {},
    langs: createLangDictionary(userConfig),
    customData: userConfig.customData || {}
  }
}

interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any
}

async function loadConfigFromBundledFile(
  fileName: string,
  bundledCode: string
): Promise<UserConfig> {
  const extension = path.extname(fileName)
  const defaultLoader = require.extensions[extension]!
  require.extensions[extension] = (module: NodeModule, filename: string) => {
    if (filename === fileName) {
      ;(module as NodeModuleWithCompile)._compile(bundledCode, filename)
    } else {
      defaultLoader(module, filename)
    }
  }
  // clear cache in case of server restart
  delete require.cache[require.resolve(fileName)]
  const raw = require(fileName)
  const config = raw.__esModule ? raw.default : raw
  require.extensions[extension] = defaultLoader
  return config
}

async function bundleConfigFile(
  fileName: string,
  mjs = false
): Promise<{ code: string; dependencies: string[] }> {
  const result = await build({
    absWorkingDir: process.cwd(),
    entryPoints: [fileName],
    outfile: 'out.js',
    write: false,
    platform: 'node',
    bundle: true,
    format: mjs ? 'esm' : 'cjs',
    sourcemap: 'inline',
    metafile: true,
    plugins: [
      {
        name: 'externalize-deps',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const id = args.path
            if (id[0] !== '.' && !path.isAbsolute(id)) {
              return {
                external: true
              }
            }
          })
        }
      },
      {
        name: 'replace-import-meta',
        setup(build) {
          build.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
            const contents = await fs.promises.readFile(args.path, 'utf8')
            return {
              loader: args.path.endsWith('.ts') ? 'ts' : 'js',
              contents: contents
                .replace(
                  /\bimport\.meta\.url\b/g,
                  JSON.stringify(`file://${args.path}`)
                )
                .replace(
                  /\b__dirname\b/g,
                  JSON.stringify(path.dirname(args.path))
                )
                .replace(/\b__filename\b/g, JSON.stringify(args.path))
            }
          })
        }
      }
    ]
  })
  const { text } = result.outputFiles[0]
  return {
    code: text,
    dependencies: result.metafile ? Object.keys(result.metafile.inputs) : []
  }
}
