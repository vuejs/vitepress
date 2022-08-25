import { App, Ref, Component } from 'vue'
import { Router } from './router.js'
import { SiteData } from '../shared.js'

export interface EnhanceAppContext {
  app: App
  router: Router
  siteData: Ref<SiteData>
}

export interface Theme {
  Layout: Component
  NotFound?: Component
  enhanceApp?: (ctx: EnhanceAppContext) => void
  setup?: () => void
}
