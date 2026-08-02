import { renderToString } from 'vue/server-renderer'
import type { SSGContext } from '../shared'
import { createApp, type PageModuleLoader } from './index'

type PageModule = Exclude<Awaited<ReturnType<PageModuleLoader>>, null>

async function renderWithLoader(
  path: string,
  loadPageModule?: PageModuleLoader
) {
  const { app, router } = await createApp(loadPageModule)
  await router.go(path)
  const ctx: SSGContext = { content: '', vpSocialIcons: new Set<string>() }
  ctx.content = await renderToString(app, ctx)
  return ctx
}

/**
 * Render with the production route loader. This supports the legacy SSR
 * bundle while the batched renderer uses `renderPage`.
 */
export function render(path: string) {
  return renderWithLoader(path)
}

/** Render a loaded page module with the shared application and theme runtime. */
export function renderPage(path: string, pageModule: PageModule | null) {
  return renderWithLoader(path, () => pageModule)
}
