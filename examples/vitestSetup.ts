import fs from 'fs-extra'
import * as http from 'http'
import os from 'os'
import path, { dirname, join, resolve } from 'path'
import type { Browser, Page } from 'playwright-chromium'
import { chromium } from 'playwright-chromium'
import type { RollupWatcher } from 'rollup'
import sirv from 'sirv'
import type { ResolvedConfig, ServerOptions, ViteDevServer } from 'vite'
import { build, createServer } from 'vitepress'
import type { File } from 'vitest'
import { beforeAll } from 'vitest'

type VitePressBuildOptions = Parameters<typeof build>[1]

// #region env

export const workspaceRoot = resolve(__dirname, '../')

export const isBuild = !!process.env.VITE_TEST_BUILD
export const isServe = !isBuild
export const isWindows = process.platform === 'win32'
export const vitePressBinPath = path.posix.join(
  workspaceRoot,
  'bin/vitepress.js'
)

// #endregion

// #region context

let server: ViteDevServer | http.Server

/**
 * Vite Dev Server when testing serve
 */
export let viteServer: ViteDevServer
/**
 * Root of the VitePress fixture
 */
export let rootDir: string
/**
 * Path to the current test file
 */
export let testPath: string
/**
 * Path to the test folder
 */
export let testDir: string
/**
 * Test folder name
 */
export let testName: string

export const serverLogs: string[] = []
export const browserLogs: string[] = []
export const browserErrors: Error[] = []

export let resolvedConfig: ResolvedConfig = undefined!

export let page: Page = undefined!
export let browser: Browser = undefined!
export let vitePressTestUrl: string = ''
export let watcher: RollupWatcher | undefined = undefined

declare module 'vite' {
  interface InlineConfig {
    testConfig?: {
      // relative base output use relative path
      // rewrite the url to truth file path
      baseRoute: string
    }
  }
}

export function setViteUrl(url: string): void {
  vitePressTestUrl = url
}

// #endregion

const DIR = join(os.tmpdir(), 'vitest_playwright_global_setup')

beforeAll(async (s) => {
  const suite = s as File
  // skip browser setup for non-examples tests
  if (!suite.filepath.includes('examples')) {
    return
  }

  const wsEndpoint = fs.readFileSync(join(DIR, 'wsEndpoint'), 'utf-8')
  if (!wsEndpoint) {
    throw new Error('wsEndpoint not found')
  }

  browser = await chromium.connect(wsEndpoint)
  page = await browser.newPage()

  const globalConsole = global.console
  const warn = globalConsole.warn
  globalConsole.warn = (msg, ...args) => {
    // suppress @vue/reactivity-transform warning
    if (msg.includes('@vue/reactivity-transform')) return
    if (msg.includes('Generated an empty chunk')) return
    warn.call(globalConsole, msg, ...args)
  }

  try {
    page.on('console', (msg) => {
      browserLogs.push(msg.text())
    })
    page.on('pageerror', (error) => {
      browserErrors.push(error)
    })

    testPath = suite.filepath!
    testName = slash(testPath).match(/examples\/([\w-]+)\//)?.[1]
    testDir = dirname(testPath)

    // if this is a test placed under examples/xxx/__tests__
    // start a vite server in that directory.
    if (testName) {
      testDir = resolve(workspaceRoot, 'examples-temp', testName)

      // when `root` dir is present, use it as vite's root
      const testCustomRoot = resolve(testDir, 'root')
      rootDir = fs.existsSync(testCustomRoot) ? testCustomRoot : testDir
      await startDefaultServe()
    }
  } catch (e) {
    // Closing the page since an error in the setup, for example a runtime error
    // when building the examples should skip further tests.
    // If the page remains open, a command like `await page.click(...)` produces
    // a timeout with an exception that hides the real error in the console.
    await page.close()
    await server?.close()
    throw e
  }

  return async () => {
    serverLogs.length = 0
    await page?.close()
    await server?.close()
    watcher?.close()
    if (browser) {
      await browser.close()
    }
  }
})

export async function startDefaultServe(): Promise<void> {
  const options: ServerOptions = undefined
  setupConsoleWarnCollector(serverLogs)

  if (!isBuild) {
    viteServer = server = await (await createServer(rootDir, options)).listen()
    const devBase = server.config.base
    vitePressTestUrl = `http://localhost:${server.config.server.port}${
      devBase === '/' ? '' : devBase
    }`
    await page.goto(vitePressTestUrl)
    // TODO: A manual reload is needed bacause the first load of page will crash
    // because of multiple vue instances. (see https://github.com/vuejs/vitepress/issues/1016)
    // Try to remove this after migrating to Vite3.
    if (isServe) {
      await page.reload()
    }
  } else {
    const options: VitePressBuildOptions = {}
    await build(rootDir, options)
    vitePressTestUrl = await startStaticServer()
    await page.goto(vitePressTestUrl)
  }
}

function startStaticServer(config?: VitePressBuildOptions): Promise<string> {
  if (!config) {
    // check if the test project has base config
    const configFile = resolve(rootDir, '.vitepress/config.ts')
    try {
      config = require(configFile)
    } catch (e) {}
  }

  // fallback internal base to ''
  let base = config?.base
  if (!base || base === '/' || base === './') {
    base = ''
  }

  // start static file server
  const serve = sirv(resolve(rootDir, '.vitepress/dist'))
  const baseDir = config?.base
  const httpServer = (server = http.createServer((req, res) => {
    if (req.url === '/ping') {
      res.statusCode = 200
      res.end('pong')
    } else {
      if (baseDir) {
        req.url = path.posix.join(baseDir, req.url)
      }
      serve(req, res)
    }
  }))
  let port = 4173
  return new Promise((resolve, reject) => {
    const onError = (e: any) => {
      if (e.code === 'EADDRINUSE') {
        httpServer.close()
        httpServer.listen(++port)
      } else {
        reject(e)
      }
    }
    httpServer.on('error', onError)
    httpServer.listen(port, () => {
      httpServer.removeListener('error', onError)
      resolve(`http://localhost:${port}${base}`)
    })
  })
}

function setupConsoleWarnCollector(logs: string[]) {
  const warn = console.warn
  console.warn = (...args) => {
    serverLogs.push(args.join(' '))
    return warn.call(console, ...args)
  }
}

export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}
