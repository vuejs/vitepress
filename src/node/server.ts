import { createServer as createViteServer, type ServerOptions } from 'vite'
import { resolveConfig } from './config'
import { createVitePressPlugin } from './plugin'
import { launchWorkers, stopWorkers } from './worker'

export async function createServer(
  root: string = process.cwd(),
  serverOptions: ServerOptions & { base?: string } = {},
  recreateServer?: () => Promise<void>
) {
  const config = await resolveConfig(root)

  if (config.parallel) launchWorkers(config.concurrency, { config: config })

  if (serverOptions.base) {
    config.site.base = serverOptions.base
    delete serverOptions.base
  }

  return createViteServer({
    root: config.srcDir,
    base: config.site.base,
    cacheDir: config.cacheDir,
    plugins: await createVitePressPlugin(config, false, {}, {}, recreateServer),
    server: serverOptions,
    customLogger: config.logger,
    configFile: config.vite?.configFile
  }).then((server) =>
    Object.assign({}, server, {
      close: () => server.close().then(() => stopWorkers('server.close()'))
    })
  )
}
