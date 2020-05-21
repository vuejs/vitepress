import { App, Ref, ComponentOptions } from 'vue'
import Layout from './Layout.vue'
import { Router } from '/@app/router'
import { SiteData } from '../../../types/shared'

export interface EnhanceAppContext {
  app: App
  router: Router
  siteData: Ref<SiteData>
}

export interface Theme {
  Layout: ComponentOptions
  NotFound?: ComponentOptions
  enhanceApp?: (ctx: EnhanceAppContext) => void
}

const theme: Theme = {
  Layout
}

export default theme
