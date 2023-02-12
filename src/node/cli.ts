import minimist from 'minimist'
import c from 'picocolors'
import { createLogger } from 'vite'
import { build, createServer, serve } from '.'
import { version } from '../../package.json'

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

if (!command || command === 'dev') {
  const createDevServer = async () => {
    const server = await createServer(root, argv, async () => {
      await server.close()
      await createDevServer()
    })
    await server.listen()
    logVersion(server.config.logger)
    server.printUrls()
  }
  createDevServer().catch((err) => {
    createLogger().error(c.red(`failed to start server. error:\n`), err)
    process.exit(1)
  })
} else {
  logVersion()
  if (command === 'build') {
    build(root, argv).catch((err) => {
      createLogger().error(c.red(`build error:\n`), err)
      process.exit(1)
    })
  } else if (command === 'serve' || command === 'preview') {
    serve(argv).catch((err) => {
      createLogger().error(c.red(`failed to start server. error:\n`), err)
      process.exit(1)
    })
  } else {
    createLogger().error(c.red(`unknown command "${command}".`))
    process.exit(1)
  }
}
