import type { App, Component, Ref } from 'vue'

import type { Awaitable, SiteData } from '../shared'
import { NotFound } from './components/NotFound'
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
   * The content of the not-found page when the site has no `404.md`. It is
   * rendered through `<Content />` like any page, with `page.isNotFound`
   * set, so the layout can still decide what goes around it.
   */
  NotFound?: Component
}

/**
 * Flattens a theme's `extends` chain: the theme's own fields win, and the
 * `enhanceApp` and `setup` hooks run base-first.
 */
export function resolveThemeExtends<T extends Theme>(theme: T): T {
  if (theme.extends) {
    const base = resolveThemeExtends(theme.extends)
    return {
      ...base,
      ...theme,
      async enhanceApp(ctx) {
        await base.enhanceApp?.(ctx)
        await theme.enhanceApp?.(ctx)
      },
      setup() {
        base.setup?.()
        theme.setup?.()
      }
    }
  }
  return theme
}

/**
 * The component rendered as the not-found page content when the site has no
 * `404.md`: the theme's `NotFound`, or the built-in one.
 */
export function resolveNotFound(theme: Theme): Component {
  return resolveThemeExtends(theme).NotFound ?? NotFound
}
