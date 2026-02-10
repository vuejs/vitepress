import { mkdist } from 'mkdist'
import fs from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'tinyglobby'
import { defineConfig } from 'tsdown'

const SRC_CLIENT = path.resolve(import.meta.dirname, 'src/client')
const DIST_CLIENT = path.resolve(import.meta.dirname, 'dist/client')

const SHARED_SHARED = path.resolve(import.meta.dirname, 'src/shared/shared.ts')
const CLIENT_SHARED = path.resolve(import.meta.dirname, 'src/client/shared.ts')
const NODE_SHARED = path.resolve(import.meta.dirname, 'src/node/shared.ts')

const typesExternal = [
  /\/vitepress\/(?!(?:dist|node_modules|vitepress|src)\/).*\.d\.ts$/,
  /^markdown-it(?:$|\/)/
]

export default defineConfig((options) => {
  const isDev = !!options.watch

  return {
    checks: isDev ? undefined : { eval: false, pluginTimings: false },
    dts: { resolver: 'tsc' },
    entry: ['src/node/index.ts', 'src/node/cli.ts'],
    external: (id, parentId) =>
      (parentId?.endsWith('.d.ts') &&
        typesExternal.some((re) => re.test(id))) ||
      undefined,
    failOnWarn: !isDev,
    fixedExtension: false,
    hooks: {
      'build:prepare': async () => {
        await ensureSymlinks(isDev)
        if (!isDev) {
          await buildClientDist()
          console.log('Client build complete.')
        }
      },
      'build:done': async () => {
        if (!isDev) {
          console.log('Node build complete.')
        }
      }
    },
    inlineOnly: false,
    logLevel: isDev ? 'info' : 'warn',
    minify: isDev ? false : { codegen: false, compress: true, mangle: false },
    nodeProtocol: true,
    outDir: 'dist/node',
    platform: 'node',
    plugins: [
      isDev && {
        name: 'custom:dev-replace',
        transform: {
          filter: { id: /\/node\/plugin\.ts$/ },
          handler: (code) =>
            code.replace(
              '"/@fs/${APP_PATH}/index.js"',
              '"/@fs/${APP_PATH}/index.ts"'
            )
        }
      }
    ],
    sourcemap: isDev,
    target: 'node20',
    tsconfig: 'src/node/tsconfig.json'
  }
})

async function buildClientDist(): Promise<void> {
  await mkdist({
    addRelativeDeclarationExtensions: true,
    cleanDist: true,
    declaration: true,
    distDir: DIST_CLIENT,
    ext: 'js',
    format: 'esm',
    pattern: '**/*.{vue,ts,css,woff2}',
    postcss: { cssnano: { preset: ['default', { discardComments: false }] } },
    srcDir: SRC_CLIENT
  })

  const dtsFiles = await glob('dist/client/**/*.d.ts')
  await Promise.all(
    dtsFiles.map(async (file) => {
      const content = await fs.readFile(file, 'utf-8')
      const updated = content.replace(/import\s+["'][^"']+["'];\n/g, '')
      if (updated !== content) {
        await fs.writeFile(file, updated)
      }
    })
  )

  const dVueFiles = await glob('dist/client/**/*.d.vue.ts')
  await Promise.all(dVueFiles.map((file) => fs.rm(file)))
}

async function ensureSymlinks(isDev: boolean): Promise<void> {
  const isWin = process.platform === 'win32'

  await Promise.all([
    fs.rm(CLIENT_SHARED, { force: true }),
    fs.rm(NODE_SHARED, { force: true }),
    fs.rm(DIST_CLIENT, { force: true, recursive: true })
  ])

  await Promise.all([
    fs[isWin ? 'link' : 'symlink'](SHARED_SHARED, CLIENT_SHARED),
    fs[isWin ? 'link' : 'symlink'](SHARED_SHARED, NODE_SHARED),
    isDev && fs.symlink(SRC_CLIENT, DIST_CLIENT, 'junction')
  ])
}
