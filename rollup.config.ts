import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { rm } from 'node:fs/promises'
import { builtinModules, createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { type RollupOptions, defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

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
  esbuild({ target: 'node22' }),
  json()
]

const esmBuild: RollupOptions = {
  input: ['src/node/index.ts', 'src/node/cli.ts'],
  output: {
    format: 'esm',
    entryFileNames: `[name].js`,
    chunkFileNames: 'chunk-[hash].js',
    dir: 'dist/node',
    sourcemap: DEV
  },
  external,
  plugins,
  onwarn(warning, warn) {
    if (warning.code !== 'EVAL') warn(warning)
  }
}

// keep .d.ts files under the repo root (e.g. types/*) external so module
// augmentations in the bundle still target the same files users reference.
// compared on normalized resolved paths so this works regardless of the
// checkout location, path separators, or drive-letter casing.
const normalizePath = (id: string): string => {
  const normalized = id.replaceAll('\\', '/')
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized
}

const root = normalizePath(fileURLToPath(new URL('.', import.meta.url)))

const typesExternal = (id: string): boolean => {
  if (external.includes(id) || /^markdown-it(?:\/|$)/.test(id)) return true
  const normalized = normalizePath(id)
  return (
    normalized.endsWith('.d.ts') &&
    normalized.startsWith(root) &&
    !normalized.startsWith(`${root}dist/`) &&
    !normalized.startsWith(`${root}node_modules/`)
  )
}

const dtsNode = dts({
  respectExternal: true,
  tsconfig: 'src/node/tsconfig.json',
  compilerOptions: { preserveSymlinks: false }
})

const nodeTypes: RollupOptions = {
  input: 'src/node/index.ts',
  output: {
    format: 'esm',
    file: 'dist/node/index.d.ts'
  },
  external: typesExternal,
  plugins: [dtsNode]
}

const clientTypes: RollupOptions = {
  input: 'dist/client-types/index.d.ts',
  output: {
    format: 'esm',
    file: 'dist/client/index.d.ts'
  },
  external: typesExternal,
  plugins: [
    dts({ respectExternal: true }),
    {
      name: 'cleanup',
      async closeBundle() {
        if (PROD) {
          await rm('dist/client-types', { recursive: true })
        }
      }
    }
  ]
}

export default defineConfig([esmBuild, nodeTypes, clientTypes])
