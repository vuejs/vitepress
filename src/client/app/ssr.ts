// entry for SSR
import { createApp } from './index.js'
import { renderToString } from 'vue/server-renderer'
import type { SSGContext } from '../shared.js'

export async function render(path: string): Promise<SSGContext> {
  const { app, router } = createApp()
  const ctx: SSGContext = { content: '' }

  await router.go(path)
  ctx.content = await renderToString(app, ctx)
  return ctx
}
