import colors from 'picocolors'
import type { ViteDevServer } from 'vite'

export type CLIShortcut = {
  key: string
  description: string
  action(server: ViteDevServer): void | Promise<void>
}

export function bindShortcuts(server: ViteDevServer): void {
  if (!server.httpServer || !process.stdin.isTTY || process.env.CI) {
    return
  }

  server.config.logger.info(
    colors.dim(colors.green('  ➜')) +
      colors.dim('  press ') +
      colors.bold('h') +
      colors.dim(' to show help')
  )

  let actionRunning = false

  const onInput = async (input: string) => {
    // ctrl+c or ctrl+d
    if (input === '\x03' || input === '\x04') {
      await server.close().finally(() => process.exit(1))
      return
    }

    if (actionRunning) return

    if (input === 'h') {
      server.config.logger.info(
        [
          '',
          colors.bold('  Shortcuts'),
          ...SHORTCUTS.map(
            (shortcut) =>
              colors.dim('  press ') +
              colors.bold(shortcut.key) +
              colors.dim(` to ${shortcut.description}`)
          )
        ].join('\n')
      )
    }

    const shortcut = SHORTCUTS.find((shortcut) => shortcut.key === input)
    if (!shortcut) return

    actionRunning = true
    await shortcut.action(server)
    actionRunning = false
  }

  process.stdin.setRawMode(true)

  process.stdin.on('data', onInput).setEncoding('utf8').resume()

  server.httpServer.on('close', () => {
    process.stdin.off('data', onInput).pause()
  })
}

const SHORTCUTS: CLIShortcut[] = [
  {
    key: 'u',
    description: 'show server url',
    action(server) {
      server.config.logger.info('')
      server.printUrls()
    }
  },
  {
    key: 'o',
    description: 'open in browser',
    action(server) {
      server.openBrowser()
    }
  },
  {
    key: 'c',
    description: 'clear console',
    action(server) {
      server.config.logger.clearScreen('error')
    }
  },
  {
    key: 'q',
    description: 'quit',
    async action(server) {
      await server.close().finally(() => process.exit())
    }
  }
]
