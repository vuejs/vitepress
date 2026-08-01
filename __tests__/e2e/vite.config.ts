import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vite'

const artifactSafetyPageRE = /(?:^|\/)ssr-plugin-safety[.]md$/

export default defineConfig({
  publicDir: process.env.VITE_TEST_SSR_PLUGIN_PARITY
    ? 'batch-public'
    : undefined,
  resolve: process.env.VITE_TEST_SSR_PLUGIN_PARITY
    ? {
        alias: {
          '/vitepress.png': path.resolve(
            import.meta.dirname,
            'public/vitepress.png'
          )
        }
      }
    : undefined,
  plugins: [
    {
      name: 'test:config-file-artifact-safety',
      apply: 'build',
      applyToEnvironment(environment) {
        const environmentName = environment.name
        return {
          name: `test:resolved-artifact-safety:${environmentName}`,
          enforce: 'pre',
          load: {
            filter: { id: artifactSafetyPageRE },
            async handler(id) {
              const source = await readFile(id, 'utf8')
              return `${source}\n<p data-resolved-load-environment="${environmentName}">physical Markdown load hook</p>`
            }
          },
          transform: {
            filter: { id: artifactSafetyPageRE },
            handler(code, _id, options) {
              const mode = options?.ssr ? 'server' : 'client'
              return `${code}\n<p data-resolved-transform-mode="${mode}">environment-sensitive Markdown transform</p>`
            }
          }
        }
      }
    }
  ]
})
