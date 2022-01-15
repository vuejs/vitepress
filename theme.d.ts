// so that users can do `import DefaultTheme from 'vitepress/theme'`
import { ComponentOptions } from 'vue'

declare const defaultTheme: {
  Layout: ComponentOptions
  NotFound: ComponentOptions
}

export default defaultTheme
