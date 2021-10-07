import { defineConfig } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'
import { resolve } from 'path'

const r = (p) => resolve(__dirname, '../', p)
const pkg = require('../package.json')

export default defineConfig({
  input: [r('src/node/index.ts'), r('src/node/cli.ts')],
  output: {
    format: 'cjs',
    dir: r('dist/node')
  },
  external: [...Object.keys(pkg.dependencies), 'buffer', 'punycode'],
  plugins: [
    alias({
      entries: {
        'readable-stream': 'stream'
      }
    }),
    commonjs(),
    nodeResolve(),
    esbuild({
      target: 'node12'
    }),
    json()
  ],
  onwarn(warning, warn) {
    if (warning.code !== 'EVAL') warn(warning)
  }
})
