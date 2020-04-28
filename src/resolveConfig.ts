import path from 'path'
import { promises as fs } from 'fs'
import { createResolver } from './utils/pathResolver'
import { Resolver } from 'vite'

const debug = require('debug')('vitepress:config')

export interface UserConfig<ThemeConfig = Record<string, any>> {
  base?: string
  title?: string
  description?: string
  head?:
    | [string, Record<string, string>]
    | [string, Record<string, string>, string]
  themeConfig?: ThemeConfig
  // TODO locales support etc.
}

export interface SiteData<ThemeConfig = Record<string, any>> {
  title: string
  description: string
  base: string
  themeConfig: ThemeConfig
  pages: PageData[]
}

export interface PageData {
  path: string
}

export interface ResolvedConfig<ThemeConfig = Record<string, any>> {
  site: SiteData<ThemeConfig>
  root: string // project root on file system
  themePath: string
  resolver: Resolver
}

export async function resolveConfig(root: string): Promise<ResolvedConfig> {
  // 1. load user config
  const configPath = path.join(root, '.vitepress/config.js')
  let hasUserConfig = false
  try {
    await fs.stat(configPath)
    hasUserConfig = true
    debug(`loading user config at ${configPath}`)
  } catch (e) {}
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

  // 4. resolve theme path
  const userThemePath = path.join(root, '.vitepress/theme')
  let themePath: string
  try {
    await fs.stat(userThemePath)
    themePath = userThemePath
  } catch (e) {
    themePath = path.join(__dirname, '../lib/theme-default')
  }

  const config: ResolvedConfig = {
    root,
    site,
    themePath,
    resolver: createResolver(themePath)
  }

  return config
}
