import { App } from 'vue'
import { joinPath } from './utils'
import { SiteDataRef } from './composables/siteData'
import { PageDataRef } from './composables/PageData'
import { Content } from './components/Content'
import Debug from './components/Debug.vue'

export function mixinGlobalComputed(
  app: App,
  site: SiteDataRef,
  siteByRoute: SiteDataRef,
  page: PageDataRef
): void {
  Object.defineProperties(app.config.globalProperties, {
    $site: {
      get() {
        return site.value
      }
    },

    $siteByRoute: {
      get() {
        return siteByRoute.value
      }
    },

    $themeConfig: {
      get() {
        return siteByRoute.value.themeConfig
      }
    },

    $page: {
      get() {
        return page.value
      }
    },

    $frontmatter: {
      get() {
        return page.value.frontmatter
      }
    },

    $title: {
      get() {
        return page.value.title || siteByRoute.value.title
      }
    },

    $description: {
      get() {
        return page.value.description || siteByRoute.value.description
      }
    },

    $withBase: {
      value(path: string) {
        return joinPath(site.value.base, path)
      }
    }
  })
}

export function mixinGlobalComponents(app: App) {
  const isProd = process.env.NODE_ENV === 'production'

  app.component('Content', Content)

  app.component('Debug', isProd ? () => null : Debug)
}
