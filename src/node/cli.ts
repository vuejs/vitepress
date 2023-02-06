import c from 'picocolors'
import minimist from 'minimist'
import { createLogger } from 'vite'
import { createServer, build, serve } from '.'
import { version } from '../../package.json'

const argv: any = minimist(process.argv.slice(2))

const tempLogger = createLogger()

const command = argv._[0]
const root = argv._[command ? 1 : 0]
if (root) {
  argv.root = root
}

if (!command || command === 'dev') {
  const createDevServer = async () => {
    const server = await createServer(root, argv, async () => {
      await server.close()
      const newServer = await createDevServer()
      await newServer.listen()
      newServer.printUrls()
    })
    return server
  }
  createDevServer()
    .then(async (server) => {
      await server.listen()
      server.config.logger.info(
        `\n  ${c.green(`${c.bold('VITEPRESS')} v${version}`)}\n`,
        { clear: !server.config.logger.hasWarned }
      )
      server.printUrls()
    })
    .catch((err) => {
      tempLogger.error(c.red(`failed to start server. error:\n${err}`))
      process.exit(1)
    })
} else {
  tempLogger.info(`\n  ${c.green(`${c.bold('VITEPRESS')} v${version}`)}\n`, {
    clear: true
  })
  if (command === 'build') {
    build(root, argv).catch((err) => {
      tempLogger.error(c.red(`build error:\n`), err)
      process.exit(1)
    })
  } else if (command === 'serve' || command === 'preview') {
    serve(argv).catch((err) => {
      tempLogger.error(c.red(`failed to start server. error:\n${err}`))
      process.exit(1)
    })
  } else {
    tempLogger.info(c.red(`unknown command "${command}".`))
    process.exit(1)
  }
}
