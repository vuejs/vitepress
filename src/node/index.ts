export { loadEnv, type Plugin } from 'vite'
export * from './build/build'
export * from './config'
export * from './contentLoader'
export type { DefaultTheme } from './defaultTheme'
export * from './init/init'
export {
  renderMd,
  type MarkdownOptions,
  type MarkdownRenderer,
  type RenderMdOptions,
  type ThemeOptions
} from './markdown/markdown'
export {
  defineRoutes,
  type ResolvedRouteConfig,
  type RouteModule
} from './plugins/dynamicRoutesPlugin'
export { defineLoader, type LoaderModule } from './plugins/staticDataPlugin'
export * from './postcss/isolateStyles'
export * from './serve/serve'
export * from './server'
export * from './utils/getGitTimestamp'

// shared types
export type {
  HeadConfig,
  Header,
  MarkdownEnv,
  MarkdownLocaleOptions,
  SiteData
} from '../../types/shared'
