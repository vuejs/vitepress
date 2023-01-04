import type { App, Ref, Component } from 'vue'
import type { Router } from './router.js'
import type { Awaitable, SiteData } from '../shared.js'

export interface EnhanceAppContext {
  app: App
  router: Router
  siteData: Ref<SiteData>
}

export interface Theme {
  Layout: Component
  NotFound?: Component
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  setup?: () => void
}
