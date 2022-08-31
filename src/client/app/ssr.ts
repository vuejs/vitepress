// entry for SSR
import { createApp } from './index.js'
// @ts-ignore pending vue release
import { renderToString } from 'vue/server-renderer'

export async function render(path: string) {
  const { app, router } = createApp()
  await router.go(path)
  return renderToString(app)
}
