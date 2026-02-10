// @ts-check

import { mkdist } from 'mkdist'
import fs from 'node:fs/promises'
import { glob } from 'tinyglobby'
import { build } from 'tsdown'

const DEV = !!process.env.DEV

const typesExternal = [
  /\/vitepress\/(?!(?:dist|node_modules|vitepress|src)\/).*\.d\.ts$/,
  /^markdown-it(?:$|\/)/
]

async function buildNode() {
  await build({
    checks: { eval: false, pluginTimings: false },
    config: false,
    dts: { resolver: 'tsc' },
    entry: ['src/node/index.ts', 'src/node/cli.ts'],
    failOnWarn: true,
    fixedExtension: false,
    inlineOnly: false,
    logLevel: 'warn',
    minify: { codegen: false, compress: true, mangle: false },
    nodeProtocol: true,
    outDir: 'dist/node',
    platform: 'node',
    target: 'node20',
    sourcemap: DEV,
    tsconfig: 'src/node/tsconfig.json',
    external: (id, parentId) =>
      (parentId?.endsWith('.d.ts') &&
        typesExternal.some((re) => re.test(id))) ||
      undefined
  })

  console.log('Node build complete.')
}

async function buildClient() {
  await mkdist({
    addRelativeDeclarationExtensions: true,
    cleanDist: !DEV,
    declaration: true,
    distDir: 'dist/client',
    ext: 'js',
    format: 'esm',
    pattern: '**/*.{vue,ts,css,woff2}',
    srcDir: 'src/client'
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

  console.log('Client build complete.')
}

await Promise.all([buildNode(), buildClient()])
