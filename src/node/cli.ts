import c from 'picocolors'
import minimist from 'minimist'
import { createServer, build, serve } from '.'
import { version } from '../../package.json'

const argv: any = minimist(process.argv.slice(2))

console.log(c.cyan(`vitepress v${version}`))

const command = argv._[0]
const root = argv._[command ? 1 : 0]
if (root) {
  argv.root = root
}

if (!command || command === 'dev') {
  createServer(root, argv)
    .then((server) => server.listen())
    .then((server) => {
      console.log()
      server.printUrls()
    })
    .catch((err) => {
      console.error(c.red(`failed to start server. error:\n`), err)
      process.exit(1)
    })
} else if (command === 'build') {
  build(root, argv).catch((err) => {
    console.error(c.red(`build error:\n`), err)
    process.exit(1)
  })
} else if (command === 'serve') {
  serve(argv).catch((err) => {
    console.error(c.red(`failed to start server. error:\n`), err)
    process.exit(1)
  })
} else {
  console.log(c.red(`unknown command "${command}".`))
  process.exit(1)
}
