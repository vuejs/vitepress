import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { defineConfig, type Rolldown, type UserConfig } from 'tsdown'
import { vueSfcPlugin } from 'vue-sfc-transformer/rolldown'

const ROOT = import.meta.dirname

// wipe all of dist (not just the outDirs) once per invocation; the configs
// set `clean: false` so watch-mode rebuilds never clear it mid-session
rmSync(path.join(ROOT, 'dist'), {
  recursive: true,
  force: true,
  maxRetries: 10
})

const normalizePath = (p: string): string => {
  const normalized = p.replaceAll('\\', '/')
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized
}

const TYPES_DIR = normalizePath(path.join(ROOT, 'types')) + '/'

function isRootTypes(id: string, importer: string | undefined): boolean {
  if (!importer || !/^\.\.?\//.test(id)) return false
  const resolved = normalizePath(path.resolve(path.dirname(importer), id))
  return resolved.startsWith(TYPES_DIR)
}

// keep .d.ts files under types/* external so module augmentations in the
// output still target the same files users reference, spelled with the .js
// extension so they resolve under node16 too
function rootTypesSpecifiers(): Rolldown.Plugin {
  return {
    name: 'vitepress:root-types-specifiers',
    resolveId: {
      order: 'pre',
      handler(id, importer) {
        if (
          importer &&
          /\.d\.[cm]?ts$/.test(importer) &&
          isRootTypes(id, importer)
        ) {
          return { id: id.replace(/\.js$/, '') + '.js', external: 'relative' }
        }
      }
    }
  }
}

// src/shared is compiled twice, once per environment, via gitignored copies.
// Copies are written only when their content differs — they are watched
// modules, so an unconditional write on every buildStart would retrigger the
// watcher in an endless loop.
function syncSharedFiles(
  dest: 'client' | 'node',
  track?: (file: string) => void
): void {
  const src = path.join(ROOT, 'src/shared')
  for (const entry of readdirSync(src, {
    recursive: true,
    encoding: 'utf8'
  })) {
    if (!entry.endsWith('.ts')) continue
    const file = path.join(src, entry)
    track?.(file)
    const content = readFileSync(file)
    const copy = path.join(ROOT, 'src', dest, entry)
    let stale = true
    try {
      stale = !content.equals(readFileSync(copy))
    } catch {}
    if (stale) writeFileSync(copy, content)
  }
}

// seed the copies now, before the entry globs below are resolved
syncSharedFiles('client')
syncSharedFiles('node')

// keeps the copies fresh across watch-mode rebuilds
function syncShared(dest: 'client' | 'node'): Rolldown.Plugin {
  return {
    name: 'vitepress:sync-shared',
    buildStart() {
      syncSharedFiles(dest, (file) => this.addWatchFile(file))
    }
  }
}

// Ships styles and fonts as-is, keeps css imports as relative specifiers in
// the output for the consumer's bundler, and drops them from declaration
// files where they would dangle.
function clientAssets(): Rolldown.Plugin {
  const src = path.join(ROOT, 'src/client')
  return {
    name: 'vitepress:client-assets',
    resolveId(id) {
      if (id.endsWith('.css') && id[0] === '.') {
        return { id, external: 'relative' }
      }
    },
    buildStart() {
      for (const entry of readdirSync(src, {
        recursive: true,
        encoding: 'utf8'
      })) {
        if (!/\.(css|woff2)$/.test(entry)) continue
        const file = path.join(src, entry)
        this.addWatchFile(file)
        this.emitFile({
          type: 'asset',
          fileName: normalizePath(entry),
          source: readFileSync(file)
        })
      }
    },
    generateBundle(_options, bundle) {
      const stripCssImports = (code: string) =>
        code.replace(/^\s*import\s+["'][^"']+\.css["'];?\s*\r?\n/gm, '')
      // vue-tsc keeps the SFC's extensionless relative specifiers; spell them
      // with .js so the declarations resolve under node16
      const addJsExtensions = (code: string) =>
        code.replace(/(['"])(\.\.?\/[^'"]*?)\1/g, (match, quote, spec) =>
          /\.[^/.]+$/.test(spec) ? match : `${quote}${spec}.js${quote}`
        )
      for (const file of Object.values(bundle)) {
        if (file.fileName.endsWith('.d.vue.ts')) {
          if (file.type === 'asset' && typeof file.source === 'string')
            file.source = addJsExtensions(stripCssImports(file.source))
        } else if (file.fileName.endsWith('.d.ts')) {
          if (file.type === 'chunk') file.code = stripCssImports(file.code)
          else if (typeof file.source === 'string')
            file.source = stripCssImports(file.source)
        }
      }
    }
  }
}

// Rebuilds re-emit every output; dropping byte-identical files before they
// are written keeps their mtimes stable, so watchers of dist (the docs dev
// server's vite) only react to files that actually changed.
function skipUnchanged(): Rolldown.Plugin {
  return {
    name: 'vitepress:skip-unchanged',
    generateBundle: {
      order: 'post',
      handler(options, bundle) {
        for (const [key, file] of Object.entries(bundle)) {
          const next =
            file.type === 'chunk'
              ? Buffer.from(file.code)
              : Buffer.from(file.source)
          try {
            const existing = readFileSync(
              path.resolve(ROOT, options.dir ?? '.', file.fileName)
            )
            if (existing.equals(next)) delete bundle[key]
          } catch {}
        }
      }
    }
  }
}

function withStableOutputs(config: UserConfig): UserConfig {
  return {
    ...config,
    clean: false,
    plugins: [...(config.plugins as Rolldown.Plugin[]), skipUnchanged()]
  }
}

const client: UserConfig = {
  entry: ['src/client/**/*.ts', '!src/client/**/*.d.ts'],
  outDir: 'dist/client',
  platform: 'neutral',
  unbundle: true,
  fixedExtension: false,
  dts: { vue: true },
  tsconfig: 'tsconfig.client.json',
  deps: {
    // self-imports and dev-server virtual modules, resolved at site build time
    neverBundle: [
      /^vitepress(?:\/|$)/,
      '@siteData',
      '@theme/index',
      '@localSearchIndex'
    ]
  },
  plugins: [
    syncShared('client'),
    rootTypesSpecifiers(),
    clientAssets(),
    vueSfcPlugin({
      srcDir: 'src/client',
      cwd: ROOT,
      tsconfig: './tsconfig.client.json'
    })
  ],
  checks: { pluginTimings: false }
}

const node: UserConfig = {
  entry: ['src/node/index.ts', 'src/node/cli.ts'],
  outDir: 'dist/node',
  platform: 'node',
  target: 'node22',
  fixedExtension: false,
  dts: true,
  tsconfig: 'tsconfig.node.json',
  // polyfill broken browser check from bundled deps
  define: {
    'navigator.userAgentData': 'undefined',
    'navigator.userAgent': 'undefined'
  },
  deps: {
    // devDependencies are bundled by design
    onlyBundle: false,
    // markdown-it types are provided by @types/markdown-it (a runtime dep)
    dts: { neverBundle: /^markdown-it(?:\/|$)/ }
  },
  // code-level compression only — no name mangling or whitespace removal
  minify: { compress: true, mangle: false, codegen: false },
  outputOptions: { chunkFileNames: 'chunk-[hash].js' },
  checks: { eval: false, pluginTimings: false },
  plugins: [syncShared('node'), rootTypesSpecifiers()]
}

export default defineConfig([client, node].map(withStableOutputs))
