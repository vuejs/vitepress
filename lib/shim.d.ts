declare const __DEV__: boolean

declare module "*.vue" {
  import { ComponentOptions } from 'vue'
  const comp: ComponentOptions
  export default comp
}

declare module "@siteData" {
  const data: string
  export default data
}

declare module "@hmr" {
  export declare const hot: {
    accept(path: string, cb: (module: any) => void)
    on(event: string, cb: (data: any) => void)
  }
}
