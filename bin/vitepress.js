#!/usr/bin/env node
const chalk = require('chalk')
const argv = require('minimist')(process.argv.slice(2))
const portfinder = require('portfinder')

console.log(chalk.cyan(`vitepress v${require('../package.json').version}`))
console.log(chalk.cyan(`vite v${require('vite/package.json').version}`))

const command = argv._[0]

if (!command || command === 'dev') {
  const root = command === 'dev' && argv._[1]
  if (root) {
    argv.root = root
  }
  require('../dist/node')
    .createServer(argv)
    .then(async (server) => {
      portfinder.basePort = parseInt(argv.port) || 3000
      const port = await portfinder.getPortPromise()
      server.listen(port, () => {
        console.log(`listening at http://localhost:${port}`)
      })
    })
    .catch((err) => {
      console.error(chalk.red(`failed to start server. error:\n`), err)
    })
} else if (command === 'build') {
  require('../dist/node')
    .build(argv)
    .catch((err) => {
      console.error(chalk.red(`build error:\n`), err)
    })
} else {
  console.log(chalk.red(`unknown command "${command}".`))
}
