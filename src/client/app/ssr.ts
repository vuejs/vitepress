// entry for SSR
import { renderToString } from 'vue/server-renderer'
import type { SSGContext } from '../shared'
import { createApp } from './index'

export async function render(path: string) {
  const { app, router } = await createApp()
  await router.go(path)
  const ctx: SSGContext = { content: '', vpSocialIcons: new Set<string>() }
  ctx.content = await renderToString(app, ctx)
  return ctx
}
