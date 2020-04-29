import Layout from './Layout.vue'

/**
 * @typedef {{
 *   app: import('vue').App
 *   router: import('../app/router').Router
 *   siteData: import('vue').Ref<object>
 * }} EnhanceAppContext
 *
 * @type {{
 *   Layout: import('vue').ComponentOptions
 *   NotFound?: import('vue').ComponentOptions
 *   enhanceApp?: (ctx: EnhanceAppContext) => void
 * }}
 */
const Theme = {
  Layout
}

export default Theme
