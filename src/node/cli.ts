import minimist from 'minimist'
import c from 'picocolors'
import { createLogger } from 'vite'
import { build, createServer, serve } from '.'
import { init } from './init/init'
import { version } from '../../package.json'
import { bindShortcuts } from './shortcuts'

const argv: any = minimist(process.argv.slice(2))

const logVersion = (logger = createLogger()) => {
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

  const open = argv.open
  delete argv.open

  const createDevServer = async (isRestart = true) => {
    const server = await createServer(
      root,
      !isRestart ? { ...argv, open } : argv,
      async () => {
        if (!restartPromise) {
          restartPromise = (async () => {
            await server.close()
            await createDevServer()
          })().finally(() => {
            restartPromise = undefined
          })
        }

        return restartPromise
      }
    )
    await server.listen()
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
  logVersion()
  if (command === 'build') {
    build(root, argv).catch((err) => {
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
