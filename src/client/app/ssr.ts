// entry for SSR
import { createApp } from './index.js'
import { renderToString } from 'vue/server-renderer'
import type { SSGContext } from '../shared.js'

export async function render(path: string) {
  const { app, router } = await createApp()
  await router.go(path)
  const ctx: SSGContext = { content: '' }
  ctx.content = await renderToString(app, ctx)
  return ctx
}
