import { createServer as createViteServer, type ServerOptions } from 'vite'
import { resolveConfig, type SiteConfig } from './config'
import { createVitePressPlugin } from './plugin'

export async function createServer(
  root: string = process.cwd(), // for backwards compatibility
  serverOptions: ServerOptions & { base?: string } = {},
  restartServer?: () => Promise<void>,
  config?: SiteConfig // new code should pass config directly
) {
  config ??= await resolveConfig(root)

  const { base, ...server } = serverOptions
  config.site.base = base ?? config.site.base

  return createViteServer({
    root: config.srcDir,
    base: config.site.base,
    cacheDir: config.cacheDir,
    plugins: await createVitePressPlugin(config, false, {}, {}, restartServer),
    server,
    customLogger: config.logger,
    configFile: config.vite?.configFile
  })
}
