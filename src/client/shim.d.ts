declare const __DEV__: boolean
declare const __VP_HASH_MAP__: Record<string, string>
declare const process: {
  env: Record<string, string>
}
declare const require: (id: string) => any

declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const comp: ComponentOptions
  export default comp
}

declare module '@siteData' {
  const data: string
  export default data
}
