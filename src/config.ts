import path from 'path'
import chalk from 'chalk'
import globby from 'globby'
import { createResolver, APP_PATH } from './utils/pathResolver'
import { Resolver } from 'vite'
import { Header } from './markdown/plugins/header'
import { exists } from './utils/fs'

const debug = require('debug')('vitepress:config')

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]

export interface UserConfig<ThemeConfig = any> {
  base?: string
  title?: string
  description?: string
  head?: HeadConfig[]
  themeConfig?: ThemeConfig
  // TODO locales support etc.
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

export interface SiteData<ThemeConfig = any> {
  title: string
  description: string
  base: string
  head: HeadConfig[]
  themeConfig: ThemeConfig
}

export interface PageData {
  title: string
  frontmatter: Record<string, any>
  headers: Header[]
  lastUpdated: number
}

const resolve = (root: string, file: string) =>
  path.join(root, `.vitepress`, file)

export async function resolveConfig(
  root: string = process.cwd()
): Promise<SiteConfig> {
  const site = await resolveSiteData(root)

  // resolve theme path
  const userThemeDir = resolve(root, 'theme')
  const themeDir = (await exists(userThemeDir))
    ? userThemeDir
    : path.join(__dirname, '../lib/theme-default')

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
  const hasUserConfig = await exists(configPath)
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
    head: userConfig.head || [],
    themeConfig: userConfig.themeConfig || {}
  }
}
