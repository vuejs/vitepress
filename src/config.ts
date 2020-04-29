import path from 'path'
import chalk from 'chalk'
import globby from 'globby'
import { promises as fs } from 'fs'
import { createResolver, APP_PATH } from './utils/pathResolver'
import { Resolver } from 'vite'

const debug = require('debug')('vitepress:config')

export interface UserConfig<ThemeConfig = any> {
  base?: string
  title?: string
  description?: string
  head?:
    | [string, Record<string, string>]
    | [string, Record<string, string>, string]
  themeConfig?: ThemeConfig
  // TODO locales support etc.
}

export interface SiteData<ThemeConfig = any> {
  title: string
  description: string
  base: string
  themeConfig: ThemeConfig
}

export interface SiteConfig<ThemeConfig = any> {
  root: string
  site: SiteData<ThemeConfig>
  configPath: string
  themeDir: string
  outDir: string
  tempDir: string
  resolver: Resolver
  pages: string[]
}

const resolve = (root: string, file: string) =>
  path.join(root, `.vitepress`, file)

export async function resolveConfig(
  root: string = process.cwd()
): Promise<SiteConfig> {
  const site = await resolveSiteData(root)

  // resolve theme path
  const userThemeDir = resolve(root, 'theme')
  let themeDir: string
  try {
    await fs.stat(userThemeDir)
    themeDir = userThemeDir
  } catch (e) {
    themeDir = path.join(__dirname, '../lib/theme-default')
  }

  const config: SiteConfig = {
    root,
    site,
    themeDir,
    pages: await globby(['**.md'], { cwd: root, ignore: ['node_modules'] }),
    configPath: resolve(root, 'config.js'),
    outDir: resolve(root, 'dist'),
    tempDir: path.resolve(APP_PATH, 'temp'),
    resolver: createResolver(themeDir)
  }

  return config
}

export async function resolveSiteData(root: string): Promise<SiteData> {
  // load user config
  const configPath = resolve(root, 'config.js')
  let hasUserConfig = false
  try {
    await fs.stat(configPath)
    hasUserConfig = true
  } catch (e) {}

  // always delete cache first before loading config
  delete require.cache[configPath]
  const userConfig: UserConfig = hasUserConfig ? require(configPath) : {}
  if (hasUserConfig) {
    debug(`loaded config at ${chalk.yellow(configPath)}`)
  } else {
    debug(`no config file found.`)
  }

  return {
    title: userConfig.title || 'VitePress',
    description: userConfig.description || 'A VitePress site',
    base: userConfig.base || '/',
    themeConfig: userConfig.themeConfig || {}
  }
}
