import { setupDevtoolsPlugin } from '@vue/devtools-api'
import type { App } from 'vue'
import type { Router } from './router'
import type { VitePressData } from './data'

const COMPONENT_STATE_TYPE = 'VitePress'

export const setupDevtools = (
  app: App,
  router: Router,
  data: VitePressData
): void => {
  setupDevtoolsPlugin(
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
      api.on.inspectComponent((payload) => {
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
