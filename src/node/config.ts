import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import globby from 'globby'
import { resolveAliases, APP_PATH, DEFAULT_THEME_PATH } from './alias'
import { SiteData, HeadConfig, LocaleConfig } from '../../types/shared'
import { MarkdownOptions } from './markdown/markdown'
import { AliasOptions } from 'vite'
export { resolveSiteDataByRoute } from './shared/config'

const debug = require('debug')('vitepress:config')

export interface UserConfig<ThemeConfig = any> {
  lang?: string
  base?: string
  title?: string
  description?: string
  head?: HeadConfig[]
  themeConfig?: ThemeConfig
  locales?: Record<string, LocaleConfig>
  alias?: Record<string, string>
  markdown?: MarkdownOptions
  // TODO locales support etc.
}

export interface SiteConfig<ThemeConfig = any> {
  root: string
  site: SiteData<ThemeConfig>
  configPath: string
  themeDir: string
  outDir: string
  tempDir: string
  alias: AliasOptions
  pages: string[]
  markdown?: MarkdownOptions
}

const resolve = (root: string, file: string) =>
  path.resolve(root, `.vitepress`, file)

export async function resolveConfig(
  root: string = process.cwd()
): Promise<SiteConfig> {
  const userConfig = await resolveUserConfig(root)
  const site = await resolveSiteData(root)

  // resolve theme path
  const userThemeDir = resolve(root, 'theme')
  const themeDir = (await fs.pathExists(userThemeDir))
    ? userThemeDir
    : DEFAULT_THEME_PATH

  const config: SiteConfig = {
    root,
    site,
    themeDir,
    pages: await globby(['**.md'], { cwd: root, ignore: ['node_modules'] }),
    configPath: resolve(root, 'config.js'),
    outDir: resolve(root, 'dist'),
    tempDir: path.resolve(APP_PATH, 'temp'),
    markdown: userConfig.markdown,
    alias: resolveAliases(root, themeDir, userConfig)
  }

  return config
}

export async function resolveUserConfig(root: string) {
  // load user config
  const configPath = resolve(root, 'config.js')
  const hasUserConfig = await fs.pathExists(configPath)
  // always delete cache first before loading config
  delete require.cache[configPath]
  const userConfig: UserConfig = hasUserConfig ? require(configPath) : {}
  if (hasUserConfig) {
    debug(`loaded config at ${chalk.yellow(configPath)}`)
  } else {
    debug(`no config file found.`)
  }

  return userConfig
}

export async function resolveSiteData(root: string): Promise<SiteData> {
  const userConfig = await resolveUserConfig(root)

  return {
    lang: userConfig.lang || 'en-US',
    title: userConfig.title || 'VitePress',
    description: userConfig.description || 'A VitePress site',
    base: userConfig.base ? userConfig.base.replace(/([^/])$/, '$1/') : '/',
    head: userConfig.head || [],
    themeConfig: userConfig.themeConfig || {},
    locales: userConfig.locales || {}
  }
}
