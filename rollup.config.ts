import * as fs from 'node:fs/promises'
import { builtinModules, createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type RollupOptions, defineConfig } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import alias from '@rollup/plugin-alias'
import dts from 'rollup-plugin-dts'
import { globSync } from 'tinyglobby'

const ROOT = fileURLToPath(import.meta.url)
const r = (p: string) => resolve(ROOT, '..', p)

const require = createRequire(import.meta.url)
const pkg = require(r('package.json'))

const DEV = !!process.env.DEV
const PROD = !DEV

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
  ...builtinModules.flatMap((m) =>
    m.includes('punycode') ? [] : [m, `node:${m}`]
  )
]

const plugins = [
  alias({ entries: { 'readable-stream': 'stream' } }),
  replace({
    // polyfill broken browser check from bundled deps
    'navigator.userAgentData': 'undefined',
    'navigator.userAgent': 'undefined',
    preventAssignment: true
  }),
  commonjs(),
  nodeResolve({ preferBuiltins: false }),
  esbuild({ target: 'node18' }),
  json()
]

const esmBuild: RollupOptions = {
  input: [
    r('src/node/index.ts'),
    r('src/node/cli.ts'),
    ...globSync(r('src/node/worker_*.ts'))
  ],
  output: {
    format: 'esm',
    entryFileNames: `[name].js`,
    chunkFileNames: 'chunk-[hash].js',
    dir: r('dist/node'),
    sourcemap: DEV
  },
  external,
  plugins,
  onwarn(warning, warn) {
    if (warning.code !== 'EVAL') warn(warning)
  }
}

const typesExternal = [
  ...external,
  /\/vitepress\/(?!(dist|node_modules)\/).*\.d\.ts$/,
  'source-map-js',
  'fast-glob'
]

const dtsNode = dts({
  respectExternal: true,
  tsconfig: r('src/node/tsconfig.json')
})

const originalResolveId = dtsNode.resolveId

dtsNode.resolveId = async function (source, importer) {
  const res = await (originalResolveId as Function).call(this, source, importer)
  if (res?.id) res.id = await fs.realpath(res.id)
  return res
}

const nodeTypes: RollupOptions = {
  input: r('src/node/index.ts'),
  output: {
    format: 'esm',
    file: r('dist/node/index.d.ts')
  },
  external: typesExternal,
  plugins: [dtsNode]
}

const clientTypes: RollupOptions = {
  input: r('dist/client-types/index.d.ts'),
  output: {
    format: 'esm',
    file: r('dist/client/index.d.ts')
  },
  external: typesExternal,
  plugins: [
    dts({ respectExternal: true }),
    {
      name: 'cleanup',
      async closeBundle() {
        if (PROD) {
          await fs.rm(r('dist/client-types'), { recursive: true })
        }
      }
    }
  ]
}

export default defineConfig([esmBuild, nodeTypes, clientTypes])
