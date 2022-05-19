import './styles/fonts.css'
import './styles/vars.css'
import './styles/base.css'
import './styles/utils.css'
import './styles/vp-doc.css'

import { Theme } from 'vitepress'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

export { DefaultTheme } from './config'

const theme: Theme = {
  Layout,
  NotFound
}

export default theme
