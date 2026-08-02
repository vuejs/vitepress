import { createStaticVNode, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import type { PageData, SSGContext } from '../shared'
import { createApp, type PageModuleLoader } from './index'

type PageModule = Exclude<Awaited<ReturnType<PageModuleLoader>>, null>

export interface StaticPagePayload {
  html: string
  pageData: PageData
}

export type SsrPagePayload = PageModule | StaticPagePayload | null

function isStaticPagePayload(
  payload: Exclude<SsrPagePayload, null>
): payload is StaticPagePayload {
  return !('default' in payload)
}

function createStaticPageModule(payload: StaticPagePayload): PageModule {
  const component = defineComponent({
    name: payload.pageData.relativePath,
    setup() {
      return () => createStaticVNode(`<div>${payload.html}</div>`, 1)
    }
  })

  return {
    default: component,
    __pageData: payload.pageData
  }
}

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
 * Render through the production route loader. This keeps the legacy full SSR
 * bundle entry working while the artifact renderer uses `renderPage` below.
 */
export function render(path: string) {
  return renderWithLoader(path)
}

/**
 * Render an already-loaded page module, or a conservative static Markdown
 * payload, through the shared application and theme runtime.
 */
export function renderPage(path: string, payload: SsrPagePayload) {
  const pageModule =
    payload && isStaticPagePayload(payload)
      ? createStaticPageModule(payload)
      : payload

  return renderWithLoader(path, () => pageModule)
}
