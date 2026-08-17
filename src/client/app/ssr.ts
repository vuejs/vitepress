// entry for SSR
import { renderToString } from 'vue/server-renderer'
import type { SSGContext } from '../shared'
import { createApp } from './index'

export async function render(path: string) {
  const { app, router } = await createApp()
  await router.go(path)
  const ctx: SSGContext = { content: '', vpSocialIcons: new Set<string>() }

  // Vue's SSR renderer reports component errors through the app's error
  // handler and continues rendering instead of rejecting renderToString,
  // which would silently ship broken pages. Collect the errors and fail
  // the build instead.
  const errors: [unknown, string][] = []
  const userErrorHandler = app.config.errorHandler
  app.config.errorHandler = (err, instance, info) => {
    errors.push([err, info])
    userErrorHandler?.(err, instance, info)
  }

  ctx.content = await renderToString(app, ctx)

  if (errors.length) {
    const details = errors
      .map(([err, info]) =>
        err instanceof Error
          ? `[${info}] ${err.stack || err.message}`
          : `[${info}] ${String(err)}`
      )
      .join('\n')
    throw new Error(`Errors during SSR rendering of ${path}:\n${details}`)
  }

  return ctx
}
