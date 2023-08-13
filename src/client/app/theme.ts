import type { App, Ref, Component } from 'vue'
import type { Router } from './router'
import type { Awaitable, SiteData } from '../shared'

export interface EnhanceAppContext {
  app: App
  router: Router
  siteData: Ref<SiteData>
}

export interface Theme {
  Layout?: Component
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  extends?: Theme

  /**
   * @deprecated can be replaced by wrapping layout component
   */
  setup?: () => void

  /**
   * @deprecated Render not found page by checking `useData().page.value.isNotFound` in Layout instead.
   */
  NotFound?: Component
}
