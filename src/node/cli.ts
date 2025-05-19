import minimist from 'minimist'
import c from 'picocolors'
import { createLogger, type Logger } from 'vite'
import { build, createServer, serve } from '.'
import { version } from '../../package.json'
import { init } from './init/init'
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

  const createDevServer = async (isRestart = true) => {
    const server = await createServer(root, argv, async () => {
      if (!restartPromise) {
        restartPromise = (async () => {
          await server.close()
          await createDevServer()
        })().finally(() => {
          restartPromise = undefined
        })
      }

      return restartPromise
    })
    await server.listen(undefined, isRestart)
    logVersion(server.config.logger)
    server.printUrls()
    bindShortcuts(server, createDevServer)
  }
  createDevServer(false).catch((err) => {
    createLogger().error(
      `${c.red(`failed to start server. error:`)}\n${err.message}\n${err.stack}`
    )
    process.exit(1)
  })
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
    }).catch((err) => {
      createLogger().error(
        `${c.red(`build error:`)}\n${err.message}\n${err.stack}`
      )
      process.exit(1)
    })
  } else if (command === 'serve' || command === 'preview') {
    serve(argv).catch((err) => {
      createLogger().error(
        `${c.red(`failed to start server. error:`)}\n${err.message}\n${err.stack}`
      )
      process.exit(1)
    })
  } else {
    createLogger().error(c.red(`unknown command "${command}".`))
    process.exit(1)
  }
}
