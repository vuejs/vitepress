import { build, type Rollup } from 'vite'
import type { SiteConfig } from '..'

const virtualEntry = 'client.js'

export async function buildMPAClient(
  js: Record<string, string>,
  config: SiteConfig
): Promise<Rollup.RollupOutput> {
  const files = Object.keys(js)
  const themeFiles = files.filter((f) => !f.endsWith('.md'))
  const pages = files.filter((f) => f.endsWith('.md'))

  return build({
    root: config.srcDir,
    cacheDir: config.cacheDir,
    base: config.site.base,
    logLevel: config.vite?.logLevel ?? 'warn',
    build: {
      emptyOutDir: false,
      outDir: config.outDir,
      rollupOptions: {
        input: [virtualEntry, ...pages]
      }
    },
    plugins: [
      {
        name: 'vitepress-mpa-client',
        resolveId(id) {
          if (id === virtualEntry) {
            return id
          }
        },
        load(id) {
          if (id === virtualEntry) {
            return themeFiles
              .map((file) => `import ${JSON.stringify(file)}`)
              .join('\n')
          } else if (id in js) {
            return js[id]
          }
        }
      }
    ]
  }) as Promise<Rollup.RollupOutput>
}
