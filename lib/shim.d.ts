declare const __DEV__: boolean

declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const comp: ComponentOptions
  export default comp
}

declare module '@siteData' {
  const data: string
  export default data
}
