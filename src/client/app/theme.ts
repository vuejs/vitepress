import type { App, Component, Ref } from 'vue'

import type { Awaitable, SiteData } from '../shared'
import type { Router } from './router'

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
   * Runs inside the root component's `setup()` (during SSR too). With
   * `extends`, setups run base-first, like `enhanceApp`.
   */
  setup?: () => void

  /**
   * @deprecated Render not found page by checking `useData().page.value.isNotFound` in Layout instead.
   */
  NotFound?: Component
}
