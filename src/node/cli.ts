import minimist from 'minimist'
import c from 'picocolors'
import { createLogger, type Logger } from 'vite'
import {
  build,
  createServer,
  disposeMdItInstance,
  resolveConfig,
  serve
} from '.'
import { version } from '../../package.json'
import { init } from './init/init'
import { clearCache } from './markdownToVue'
import { bindShortcuts } from './shortcuts'

if (process.env.DEBUG) {
  Error.stackTraceLimit = Infinity
}

const argv: any = minimist(process.argv.slice(2))

Object.keys(argv).forEach((key) => {
  if (argv[key] === 'true') {
    argv[key] = true
  } else if (argv[key] === 'false') {
    argv[key] = false
  }
})

const logVersion = (logger: Logger) => {
  logger.info(`\n  ${c.green(`${c.bold('vitepress')} v${version}`)}\n`, {
    clear: !logger.hasWarned
  })
}

const command = argv._[0]
const root = argv._[command ? 1 : 0]
if (root) {
  argv.root = root
}

let restartPromise: Promise<void> | undefined

if (!command || command === 'dev') {
  if (argv.force) {
    delete argv.force
    argv.optimizeDeps = { force: true }
  }

  let config = await resolveConfig(root, argv).catch(
    logErrorAndExit.bind(null, `failed to resolve config. error:`)
  )
  const createDevServer = async (isRestart = true) => {
    const server = await createServer(root, argv, restartServer, config)
    function restartServer() {
      if (!restartPromise) {
        restartPromise = (async () => {
          try {
            config = await resolveConfig(root, argv)
          } catch (err: any) {
            logError(`failed to resolve config. error:`, err)
            return
          }
          disposeMdItInstance()
          clearCache()
          await server.close()
          await createDevServer()
        })().finally(() => {
          restartPromise = undefined
        })
      }
      return restartPromise
    }
    await server.listen(undefined, isRestart)
    logVersion(server.config.logger)
    server.printUrls()
    bindShortcuts(server, restartServer)
  }
  createDevServer(false).catch(
    logErrorAndExit.bind(null, `failed to start server. error:`)
  )
} else if (command === 'init') {
  createLogger().info('', { clear: true })
  init(argv.root)
} else {
  if (command === 'build') {
    build(root, {
      ...argv,
      onAfterConfigResolve(siteConfig) {
        logVersion(siteConfig.logger)
      }
    }).catch(logErrorAndExit.bind(null, `build error:`))
  } else if (command === 'serve' || command === 'preview') {
    serve(argv).catch(
      logErrorAndExit.bind(null, `failed to start server. error:`)
    )
  } else {
    logErrorAndExit(`unknown command "${command}".`)
  }
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
