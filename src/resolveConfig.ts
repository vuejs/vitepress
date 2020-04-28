import path from 'path'
import { promises as fs } from 'fs'
import { createResolver } from './utils/pathResolver'
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
  pages: PageData[]
}

export interface PageData {
  path: string
}

export interface ResolvedConfig<ThemeConfig = any> {
  site: SiteData<ThemeConfig>
  themePath: string
  resolver: Resolver
}

export const getConfigPath = (root: string) =>
  path.join(root, '.vitepress/config.js')

export async function resolveConfig(root: string): Promise<ResolvedConfig> {
  const site = await resolveSiteData(root)

  // resolve theme path
  const userThemePath = path.join(root, '.vitepress/theme')
  let themePath: string
  try {
    await fs.stat(userThemePath)
    themePath = userThemePath
  } catch (e) {
    themePath = path.join(__dirname, '../lib/theme-default')
  }

  const config: ResolvedConfig = {
    site,
    themePath,
    resolver: createResolver(themePath)
  }

  return config
}

export async function resolveSiteData(root: string): Promise<SiteData> {
  // 1. load user config
  const configPath = getConfigPath(root)
  let hasUserConfig = false
  try {
    await fs.stat(configPath)
    hasUserConfig = true
    debug(`loading user config at ${configPath}`)
  } catch (e) {}

  // always delete cache first before loading config
  delete require.cache[configPath]
  const userConfig: UserConfig = hasUserConfig ? require(configPath) : {}

  // 2. TODO scan pages data

  // 3. resolve site data
  const site: SiteData = {
    title: userConfig.title || 'VitePress',
    description: userConfig.description || 'A VitePress site',
    base: userConfig.base || '/',
    themeConfig: userConfig.themeConfig || {},
    pages: []
  }

  return site
}
