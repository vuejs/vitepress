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
    }
  }
}

// Declarations must resolve under node16, so relative specifiers need the .js
// extension: vue-tsc keeps the SFC's extensionless ones in .d.vue.ts files,
// and rolldown-plugin-dts drops the extension from chunk imports on Windows.
// Dangling side-effect css imports are removed along the way.
function fixDeclarationSpecifiers(): Rolldown.Plugin {
  const stripCssImports = (code: string) =>
    code.replace(/^\s*import\s+["'][^"']+\.css["'];?\s*\r?\n/gm, '')
  const addJsExtensions = (code: string) =>
    code.replace(
      /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.\.?\/[^'"]*?)\2/g,
      (match, keyword, quote, spec) =>
        /\.[^/.]+$/.test(spec) ? match : `${keyword}${quote}${spec}.js${quote}`
    )
  const fix = (code: string) => addJsExtensions(stripCssImports(code))
  return {
    name: 'vitepress:fix-declaration-specifiers',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (!/\.d\.(?:vue\.)?ts$/.test(file.fileName)) continue
        if (file.type === 'chunk') file.code = fix(file.code)
        else if (typeof file.source === 'string') file.source = fix(file.source)
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

// The node bundle inlines its devDependencies by design, so the published
// artifact redistributes third-party code. Every module that ends up in an
// emitted chunk is traced back to its package here, and the aggregate
// notices — license texts with their copyright lines, plus any NOTICE files
// (Apache-2.0 §4(d)) — are written to THIRD-PARTY-NOTICES.md. npm does not
// auto-include that name, so it ships only via the files list in
// package.json; `pnpm check` fails when the committed copy goes stale. The
// file is regenerated by the build — do not edit it by hand. Entries with
// byte-identical texts are grouped: the copyright notices the licenses
// require live inside the quoted texts, so grouping loses nothing.
const NOTICES_FILE = 'THIRD-PARTY-NOTICES.md'

// licenses whose redistribution obligations this file's mechanism fully
// discharges: carrying the verbatim license text and copyright notice along
// (plus NOTICE propagation for Apache-2.0, and the modifications statement
// in the header). Anything else fails the build so its obligations get
// reviewed deliberately instead of silently shipped — copyleft (GPL),
// source-offer duties (MPL/LGPL), unparseable ids, and also e.g. Zlib and
// Python-2.0, whose mark-your-changes clauses an aggregate notices file
// cannot satisfy on its own.
const PERMITTED_LICENSES = new Set([
  '0BSD',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BlueOak-1.0.0',
  'CC0-1.0',
  'ISC',
  'MIT',
  'OFL-1.1',
  'Unlicense'
])

// canonical license bodies for packages that declare an id but ship no text
// file. MIT/ISC require the copyright and permission notice to accompany
// copies, so a bare identifier would not be compliant; the reconstruction
// pairs the fixed license wording with the package's own author line and is
// surfaced as a warning on every full build.
const LICENSE_TEMPLATES: Record<string, (holder: string) => string> = {
  MIT: (holder) => `MIT License

Copyright (c) ${holder}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  ISC: (holder) => `ISC License

Copyright (c) ${holder}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`
}

// copyright holders for packages that ship neither a license file nor an
// author field, verified against their repositories
const AUTHOR_FALLBACKS: Record<string, string> = {
  '@polka/compression': 'Luke Edwards <luke@lukeed.com> (https://lukeed.com)'
}

interface BundledPackage {
  name: string
  version?: string
  license: string
  authors?: string
  repository?: string
  licenseText: string
  noticeText?: string
  reconstructed?: boolean
}

// third-party content vendored into src rather than resolved from
// node_modules: the Inter font files shipped under theme-default/fonts
const VENDORED_PACKAGES: BundledPackage[] = [
  {
    name: 'Inter',
    license: 'OFL-1.1',
    authors: 'The Inter Project Authors',
    repository: 'https://github.com/rsms/inter',
    licenseText: readFileSync(
      path.join(ROOT, 'src/client/theme-default/fonts/LICENSE.txt'),
      'utf8'
    )
      .replaceAll('\r\n', '\n')
      .trim()
  }
]

// localeCompare consults the host locale; the output must be byte-stable
// across machines, so sort by code units everywhere
const compareStrings = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

const blockquote = (text: string) =>
  text
    .split('\n')
    .map((l) => (l ? `> ${l}` : '>'))
    .join('\n')

function formatPerson(person: unknown): string | undefined {
  if (typeof person === 'string') return person
  const { name, email, url } = (person ?? {}) as Record<string, string>
  if (!name) return undefined
  return name + (email ? ` <${email}>` : '') + (url ? ` (${url})` : '')
}

// render repository fields as plain https URLs, whatever form the manifest
// uses (git+/git@/ssh, github: and owner/repo shorthands)
function normalizeRepoUrl(url: string): string {
  const repo = url
    .replace(/^git\+/, '')
    .replace(/\.git$/, '')
    .replace(/^git@([^:]+):/, 'https://$1/')
    .replace(/^(?:git|ssh):\/\/(?:[^@/]+@)?/, 'https://')
    .replace(/^github:/, 'https://github.com/')
    .replace(/^gitlab:/, 'https://gitlab.com/')
    .replace(/^bitbucket:/, 'https://bitbucket.org/')
  return /^[\w.-]+\/[\w.-]+$/.test(repo) ? `https://github.com/${repo}` : repo
}

type PackageResolution = { info: BundledPackage } | { error: string } | null

const packageCache = new Map<string, PackageResolution>()

// a module's package root is everything up to the first path segment (two
// for scoped packages) after the last node_modules/ in its id — this holds
// for pnpm's .pnpm layout too, where the real package dir always sits under
// a nested node_modules/
function resolveBundledPackage(moduleId: string): PackageResolution {
  if (moduleId.startsWith('\0')) return null
  const id = moduleId.replaceAll('\\', '/').replace(/\?.*$/, '')
  const base = id.lastIndexOf('/node_modules/')
  if (base === -1) return null
  const segments = id.slice(base + '/node_modules/'.length).split('/')
  const name =
    segments[0][0] === '@' ? segments.slice(0, 2).join('/') : segments[0]
  if (name[0] === '.') return null
  const root = id.slice(0, base) + '/node_modules/' + name
  const cached = packageCache.get(root)
  if (cached !== undefined) return cached
  const resolution = readPackageNotices(root, name)
  packageCache.set(root, resolution)
  return resolution
}

function readPackageNotices(root: string, dirName: string): PackageResolution {
  let pkg: Record<string, any>
  try {
    pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
  } catch {
    return { error: `${dirName}: no readable package.json at ${root}` }
  }
  const name: string = pkg.name ?? dirName
  const license: string | undefined =
    typeof pkg.license === 'string'
      ? pkg.license
      : (pkg.license?.type ??
        (Array.isArray(pkg.licenses)
          ? pkg.licenses
              .map((l: any) => (typeof l === 'string' ? l : l?.type))
              .filter(Boolean)
              .join(' OR ')
          : undefined))
  if (!license) {
    return { error: `${name}: declares no license in its package.json` }
  }
  // an SPDX OR expression satisfies the policy if any alternative does; AND
  // and WITH combine obligations, so those always need review as a whole
  const alternatives = /\s(?:AND|WITH)\s/.test(license)
    ? []
    : license.replace(/[()]/g, '').split(/\s+OR\s+/)
  if (!alternatives.some((l) => PERMITTED_LICENSES.has(l.trim()))) {
    return {
      error:
        `${name} is licensed under "${license}", which is not in ` +
        'PERMITTED_LICENSES — review its obligations before extending the set'
    }
  }

  const people = [
    pkg.author,
    ...(Array.isArray(pkg.contributors) ? pkg.contributors : []),
    ...(Array.isArray(pkg.maintainers) ? pkg.maintainers : [])
  ]
    .map(formatPerson)
    .filter((p): p is string => !!p)
  const authors = [...new Set(people)].join(', ') || AUTHOR_FALLBACKS[name]
  const repositoryField =
    typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url
  const repository = repositoryField
    ? normalizeRepoUrl(repositoryField)
    : undefined

  const tryReadText = (file: string): string | undefined => {
    try {
      return readFileSync(path.join(root, file), 'utf8')
        .replace(/^\uFEFF/, '')
        .replaceAll('\r\n', '\n')
        .trim()
    } catch {
      return undefined
    }
  }

  let entries: string[]
  try {
    entries = readdirSync(root)
  } catch {
    entries = []
  }
  // NOTICE files carry their own propagation obligation and ride along even
  // when a license file exists too
  const noticeText =
    entries
      .filter((f) => /^notices?(?:$|[-._])/i.test(f))
      .sort(compareStrings)
      .map(tryReadText)
      .filter(Boolean)
      .join('\n\n') || undefined
  const rank = (f: string) => (/^licen[cs]e/i.test(f) ? 0 : 1)
  const licenseFile = entries
    .filter((f) =>
      /^(?:(?:un)?licen[cs]e|copying|(?:mit|bsd|apache|isc)[-_.]licen[cs]e)(?:$|[-._])/i.test(
        f
      )
    )
    .sort((a, b) => rank(a) - rank(b) || compareStrings(a, b))[0]

  let licenseText = licenseFile ? tryReadText(licenseFile) : undefined
  let reconstructed = false
  if (!licenseText) {
    const template = LICENSE_TEMPLATES[license]
    if (!template || !authors) {
      return {
        error:
          `${name} (${license}) ships no license text and it cannot be ` +
          'reconstructed — vendor its license text in tsdown.config.ts'
      }
    }
    licenseText = template(authors)
    reconstructed = true
  }

  return {
    info: {
      name,
      version: pkg.version,
      license,
      authors,
      repository,
      licenseText,
      noticeText,
      reconstructed
    }
  }
}

function renderNotices(packages: BundledPackage[]): string {
  // group packages whose texts match byte-for-byte (same license wording
  // and same copyright holder), so shared boilerplate appears once
  interface NoticeGroup {
    names: string[]
    licenses: string[]
    authors: string[]
    repositories: string[]
    licenseText: string
    noticeText?: string
  }
  const groups = new Map<string, NoticeGroup>()
  for (const p of packages) {
    // texts without a copyright notice line (BlueOak, CC0, …) cannot name
    // their holders themselves, so different holders must not merge — the
    // By: line is the only attribution such an entry has
    const hasHolder = /copyright\s+(?:\(c\)|©|[0-9])/i.test(p.licenseText)
    const key =
      p.licenseText +
      '\0' +
      (p.noticeText ?? '') +
      (hasHolder ? '' : '\0' + (p.authors ?? p.name))
    let group = groups.get(key)
    if (!group) {
      group = {
        names: [],
        licenses: [],
        authors: [],
        repositories: [],
        licenseText: p.licenseText,
        noticeText: p.noticeText
      }
      groups.set(key, group)
    }
    if (!group.names.includes(p.name)) group.names.push(p.name)
    if (!group.licenses.includes(p.license)) group.licenses.push(p.license)
    if (p.authors && !group.authors.includes(p.authors)) {
      group.authors.push(p.authors)
    }
    if (p.repository && !group.repositories.includes(p.repository)) {
      group.repositories.push(p.repository)
    }
  }
  const sorted = [...groups.values()]
  for (const g of sorted) {
    g.names.sort(compareStrings)
    g.licenses.sort(compareStrings)
    g.authors.sort(compareStrings)
    g.repositories.sort(compareStrings)
  }
  // same leading name can occur twice when two bundled versions of a package
  // carry different texts; tie-break on the text to keep the order stable
  sorted.sort(
    (a, b) =>
      compareStrings(a.names[0], b.names[0]) ||
      compareStrings(a.licenseText, b.licenseText) ||
      compareStrings(a.noticeText ?? '', b.noticeText ?? '')
  )

  const ids = [...new Set(packages.map((p) => p.license))].sort(compareStrings)
  let out =
    '# Third-party notices\n\n' +
    'VitePress is published under the MIT license (see LICENSE). The ' +
    'published vitepress package additionally bundles code and font files ' +
    'from the projects listed below, used under the following licenses: ' +
    `${ids.join(', ')}. The bundled code has been mechanically ` +
    'transformed from its original source form (concatenated, tree-shaken, ' +
    'and minified), and the font files are subsets of their original ' +
    'releases.\n'
  for (const g of sorted) {
    out += `\n## ${g.names.join(', ')}\n\n`
    out += `License: ${g.licenses.join(', ')}\n`
    if (g.authors.length) out += `By: ${g.authors.join(', ')}\n`
    if (g.repositories.length) {
      out += `Repository: ${g.repositories.join(', ')}\n`
    }
    out += '\n' + blockquote(g.licenseText) + '\n'
    if (g.noticeText) out += '\nNotice:\n\n' + blockquote(g.noticeText) + '\n'
  }
  return out
}

const collectedPackages = new Map<string, Map<string, BundledPackage>>()
// assigned where the configs are assembled at the bottom of this file; the
// notices file is only written once every config has reported, so building
// a lone config can never shrink it to a subset
let expectedOutputs = 0

// …and a build where some output never reports (a lone config, or drift in
// how the configs are assembled) must fail loudly instead of silently
// leaving a stale file behind. Watch mode never collects, so it never trips
// this.
process.on('beforeExit', () => {
  if (collectedPackages.size > 0 && collectedPackages.size < expectedOutputs) {
    console.error(
      `${NOTICES_FILE} was not regenerated: only ` +
        `${collectedPackages.size} of ${expectedOutputs} build outputs reported`
    )
    process.exitCode = 1
  }
})

function thirdPartyNotices(): Rolldown.Plugin {
  return {
    name: 'vitepress:third-party-notices',
    // default-order generateBundle runs before skipUnchanged's post handler
    // prunes byte-identical files, so the module lists are still complete
    generateBundle(options, bundle) {
      // build-only: dev rebuilds shouldn't churn a tracked file — full
      // builds and the check script keep it fresh
      if (this.meta.watchMode) return
      const errors = new Set<string>()
      const found = new Map<string, BundledPackage>()
      for (const file of Object.values(bundle)) {
        if (file.type !== 'chunk') continue
        for (const [id, mod] of Object.entries(file.modules)) {
          // fully tree-shaken modules contribute nothing to the output
          // (declaration chunks report real lengths too)
          if (mod.renderedLength === 0) continue
          const resolution = resolveBundledPackage(id)
          if (!resolution) continue
          if ('error' in resolution) {
            errors.add(resolution.error)
            continue
          }
          const { info } = resolution
          found.set(`${info.name}@${info.version}`, info)
        }
      }
      if (errors.size) {
        this.error([...errors].sort(compareStrings).join('\n'))
      }
      collectedPackages.set(options.dir ?? '.', found)
      if (collectedPackages.size < expectedOutputs) return

      const union = new Map<string, BundledPackage>()
      for (const packages of collectedPackages.values()) {
        for (const [key, info] of packages) union.set(key, info)
      }
      const reconstructed = [...union.values()]
        .filter((p) => p.reconstructed)
        .map((p) => p.name)
        .sort(compareStrings)
      if (reconstructed.length) {
        console.warn(
          `license text for ${reconstructed.join(', ')} is reconstructed ` +
            'from their manifests — they ship none'
        )
      }
      const content = renderNotices([...VENDORED_PACKAGES, ...union.values()])
      const dest = path.join(ROOT, NOTICES_FILE)
      // same mtime-stability contract as skipUnchanged above
      try {
        if (readFileSync(dest, 'utf8') === content) return
      } catch {}
      writeFileSync(dest, content)
      console.warn(`\n${NOTICES_FILE} updated — commit the regenerated file`)
    }
  }
}

function withStableOutputs(config: UserConfig): UserConfig {
  return {
    ...config,
    clean: false,
    plugins: [
      ...(config.plugins as Rolldown.Plugin[]),
      fixDeclarationSpecifiers(),
      thirdPartyNotices(),
      skipUnchanged()
    ]
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

const configs = [client, node].map(withStableOutputs)
expectedOutputs = configs.length

export default defineConfig(configs)
