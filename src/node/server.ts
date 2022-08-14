import { createServer as createViteServer, ServerOptions } from 'vite'
import { resolveConfig } from './config'
import { createVitePressPlugin } from './plugin'

export async function createServer(
  root: string = process.cwd(),
  serverOptions: ServerOptions = {},
  recreateServer?: () => Promise<void>
) {
  const config = await resolveConfig(root)

  if (serverOptions.base) {
    config.site.base = serverOptions.base
    delete serverOptions.base
  }

  return createViteServer({
    root: config.srcDir,
    base: config.site.base,
    // logLevel: 'warn',
    plugins: await createVitePressPlugin(config, false, {}, {}, recreateServer),
    server: serverOptions
  })
}
