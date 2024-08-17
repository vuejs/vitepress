import DefaultTheme from 'vitepress/theme'
import type { EnhanceAppContext } from 'vitepress'
import { GroupIconComponent } from 'vitepress-plugin-group-icons/client'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(GroupIconComponent)
  }
}
