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

const CLOSE_TIMEOUT = 10000

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

  // vite's close waits for in-flight transform requests, which never settle
  // once the plugin container and dep optimizer are torn down under them. the
  // port, the watcher and the ws server are released well before that, so stop
  // waiting and let the restart go on
  async function closeServer() {
    let timer: ReturnType<typeof setTimeout> | undefined
    const closed = await Promise.race([
      server.close().then(
        () => true,
        (err: any) => {
          logError(`failed to close server. error:`, err)
          return true
        }
      ),
      new Promise<false>((resolve) => {
        timer = setTimeout(resolve, CLOSE_TIMEOUT, false)
      })
    ])
    clearTimeout(timer)
    if (!closed) {
      createLogger().warn(
        c.yellow(
          `server didn't close in ${CLOSE_TIMEOUT / 1000}s, restarting anyway`
        )
      )
    }
  }

  // the config watcher and the r shortcut can both ask at once
  function restartServer() {
    if (!restartPromise) {
      // between the two servers nothing references the event loop, so a stall
      // anywhere in a restart would drain node into a silent exit(0)
      const keepAlive = setInterval(() => {}, 1 << 30)
      restartPromise = restart().finally(() => {
        clearInterval(keepAlive)
        restartPromise = undefined
      })
    }
    return restartPromise
  }

  async function restart() {
    const prevConfig = config
    try {
      config = await resolveConfig(root, argv)
    } catch (err: any) {
      logError(`failed to resolve config. error:`, err)
      return
    }

    disposeMdItInstance()
    clearCache()
    await closeServer()

    try {
      await startServer()
    } catch (err: any) {
      logError(`failed to restart server. error:`, err)
      // the old server is already closed, so bailing out here leaves the
      // session with no server and no watcher — come back up on the last
      // known good config so a fix can trigger a fresh restart
      config = prevConfig
      // the failed attempt may have memoized a half-configured renderer
      disposeMdItInstance()
      clearCache()
      createLogger().warn(c.yellow(`falling back to the previous config`))
      await startServer().catch(
        logErrorAndExit.bind(null, `failed to restore server. error:`)
      )
    }
  }

  // a stray unhandled rejection (from a user config, a theme, or a plugin)
  // must not take down a long-lived dev session
  process.on('unhandledRejection', (err) => {
    logError(`unhandled rejection:`, err)
  })

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
