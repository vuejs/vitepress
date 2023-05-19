// entry for SSR
import { renderToString } from 'vue/server-renderer'
import { createApp } from './index'
import type { SSGContext } from '../shared'

export async function render(path: string) {
  const { app, router } = await createApp()
  await router.go(path)
  const ctx: SSGContext = { content: '' }
  ctx.content = await renderToString(app, ctx)
  return ctx
}
