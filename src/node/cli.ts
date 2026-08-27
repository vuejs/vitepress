import minimist from 'minimist'
import c from 'picocolors'
import { createLogger, type ViteDevServer } from 'vite'

import {
  build,
  createServer,
  disposeMdItInstance,
  resolveConfig,
  serve
} from '.'
import { init } from './init/init'
import { clearCache } from './markdownToVue'
import { bindShortcuts } from './shortcuts'
import { logVersion } from './utils/logVersion'

const argv: any = minimist(process.argv.slice(2))

// minimist keeps `--flag=true` as the string 'true'
Object.keys(argv).forEach((key) => {
  if (argv[key] === 'true') {
    argv[key] = true
  } else if (argv[key] === 'false') {
    argv[key] = false
  }
})

// vitepress [command] [root]
const command = argv._[0]
const root = argv._[command ? 1 : 0]
if (root) {
  argv.root = root
}

if (!command || command === 'dev') {
  runDev(root, argv).catch(
    logErrorAndExit.bind(null, `failed to start server. error:`)
  )
} else if (command === 'init') {
  createLogger().info('', { clear: true })
  init(argv.root)
} else if (command === 'build') {
  build(root, argv).catch(logErrorAndExit.bind(null, `build error:`))
} else if (command === 'serve' || command === 'preview') {
  serve(argv).catch(
    logErrorAndExit.bind(null, `failed to start server. error:`)
  )
} else {
  logErrorAndExit(`unknown command "${command}".`)
}

async function runDev(root: string, argv: any) {
  if (argv.force) {
    // vite moved --force under optimizeDeps
    delete argv.force
    argv.optimizeDeps = { force: true }
  }

  let config = await resolveConfig(root, argv).catch(
    logErrorAndExit.bind(null, `failed to resolve config. error:`)
  )
  let server: ViteDevServer
  let restartPromise: Promise<void> | undefined

  async function startServer(isRestart = true) {
    server = await createServer(root, argv, restartServer, config)
    // isRestart keeps vite from reopening the browser
    await server.listen(undefined, isRestart)
    logVersion(server.config.logger)
    server.printUrls()
    bindShortcuts(server, restartServer)
  }

  // the config watcher and the r shortcut can both ask at once
  function restartServer() {
    restartPromise ??= restart().finally(() => {
      restartPromise = undefined
    })
    return restartPromise
  }

  async function restart() {
    try {
      config = await resolveConfig(root, argv)
    } catch (err: any) {
      logError(`failed to resolve config. error:`, err)
      return
    }

    disposeMdItInstance()
    clearCache()
    await server.close()
    await startServer()
  }

  await startServer(false)
}

function logErrorAndExit(message: string, err?: any): never {
  logError(message, err)
  process.exit(1)
}

function logError(message: string, err?: any) {
  const logger = createLogger()
  logger.error(
    [
      c.red(message),
      err && 'message' in err && err.message,
      err && 'stack' in err && err.stack
    ]
      .filter(Boolean)
      .join('\n')
  )
}
