import { setupDevToolsPlugin } from '@vue/devtools-api'
import type { App } from 'vue'
import type { VitePressData } from './data'
import type { Router } from './router'

const COMPONENT_STATE_TYPE = 'VitePress'

export const setupDevtools = (
  app: App,
  router: Router,
  data: VitePressData
): void => {
  setupDevToolsPlugin(
    {
      // fix recursive reference
      app: app as any,
      id: 'org.vuejs.vitepress',
      label: 'VitePress',
      packageName: 'vitepress',
      homepage: 'https://vitepress.dev',
      componentStateTypes: [COMPONENT_STATE_TYPE]
    },
    (api) => {
      // TODO: remove any
      api.on.inspectComponent((payload: any) => {
        payload.instanceData.state.push({
          type: COMPONENT_STATE_TYPE,
          key: 'route',
          value: router.route,
          editable: false
        })

        payload.instanceData.state.push({
          type: COMPONENT_STATE_TYPE,
          key: 'data',
          value: data,
          editable: false
        })
      })
    }
  )
}
