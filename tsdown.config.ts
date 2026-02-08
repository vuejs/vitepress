import { watch, type ChokidarOptions } from 'chokidar'
import fs from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'tinyglobby'
import { defineConfig, type UserConfig } from 'tsdown'

const DEV = process.argv.includes('--watch') || process.argv.includes('-w')

const clientBase = path.resolve(import.meta.dirname, 'src/client')
const nodeBase = path.resolve(import.meta.dirname, 'src/node')
const sharedBase = path.resolve(import.meta.dirname, 'src/shared')

const distBase = path.resolve(import.meta.dirname, 'dist')
const distClientBase = path.resolve(import.meta.dirname, 'dist/client')

const typesExternal = [
  /\/vitepress\/(?!(?:dist|node_modules|vitepress|src)\/).*\.d\.ts$/,
  /^markdown-it(?:$|\/)/
]

await copyAndWatch()

const common = {
  checks: { eval: false, pluginTimings: false },
  clean: false,
  dts: { resolver: 'tsc' },
  failOnWarn: !DEV,
  fixedExtension: false,
  inlineOnly: false,
  logLevel: 'warn',
  minify: { codegen: false, compress: true, mangle: false },
  nodeProtocol: true,
  sourcemap: DEV,
  external: (id, parentId) =>
    (parentId?.endsWith('.d.ts') && typesExternal.some((re) => re.test(id))) ||
    undefined
} satisfies UserConfig

export default defineConfig([
  {
    ...common,
    name: 'node',
    entry: ['src/node/index.ts', 'src/node/cli.ts'],
    outDir: 'dist/node',
    platform: 'node',
    target: 'node20',
    tsconfig: 'src/node/tsconfig.json'
  },
  {
    ...common,
    name: 'client',
    entry: ['src/client/**/*.ts'],
    outDir: 'dist/client',
    platform: 'neutral',
    target: ['node20', 'chrome107', 'firefox104', 'safari16'],
    tsconfig: 'src/client/tsconfig.json',
    external: (id, parentId) =>
      id === '@localSearchIndex' ||
      id === '@siteData' ||
      id === '@theme/index' ||
      shouldCopyFromClient(id) ||
      common.external(id, parentId)
  }
])

// #region Watchers

async function copyAndWatch() {
  await fs.rm(distBase, { recursive: true, force: true, maxRetries: 10 })
  await Promise.all([
    ...(await glob('**/*', { cwd: sharedBase })).map(cpShared),
    ...(await glob('**/*', { cwd: clientBase })).map(cpClient)
  ])

  if (!DEV) return

  const watcherOpts: ChokidarOptions = {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 }
  }

  const sharedWatcher = watch('.', {
    cwd: sharedBase,
    ignored: (val, stats) => !!stats?.isFile() && !shouldCopyFromShared(val),
    ...watcherOpts
  })
    .on('add', cpShared)
    .on('change', cpShared)

  const assetWatcher = watch('.', {
    cwd: clientBase,
    ignored: (val, stats) => !!stats?.isFile() && !shouldCopyFromClient(val),
    ...watcherOpts
  })
    .on('add', cpClient)
    .on('change', cpClient)
    .on('unlink', rmClient)

  const closeAll = async () => {
    await Promise.allSettled([sharedWatcher.close(), assetWatcher.close()])
  }

  process.once('SIGINT', () => closeAll().finally(() => process.exit(0)))
  process.once('SIGTERM', () => closeAll().finally(() => process.exit(0)))
  process.once('exit', () => closeAll())
}

async function cpShared(rel: string) {
  if (!shouldCopyFromShared(rel)) return
  const src = path.join(sharedBase, rel)
  const destClient = path.join(clientBase, rel)
  const destNode = path.join(nodeBase, rel)
  await fs.copyFile(src, destClient)
  await fs.copyFile(src, destNode)
}

async function cpClient(rel: string) {
  if (!shouldCopyFromClient(rel)) return
  const src = path.join(clientBase, rel)
  const dest = path.join(distClientBase, rel)
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.copyFile(src, dest)
}

async function rmClient(rel: string) {
  const dest = path.join(distClientBase, rel)
  await fs.rm(dest, { force: true })
}

function shouldCopyFromShared(id: string) {
  return id.endsWith('.ts')
}

function shouldCopyFromClient(id: string) {
  return id.endsWith('.css') || id.endsWith('.vue') || id.endsWith('.woff2')
}

// #endregion
