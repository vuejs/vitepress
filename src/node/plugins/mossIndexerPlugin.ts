import { createDebug } from 'obug'
import type { Plugin } from 'vite'
import type { SiteConfig } from '../config'
import type { DefaultTheme } from '../defaultTheme'
import { sync } from '@moss-tools/md-indexer'

const debug = createDebug('vitepress:moss-indexer')

export async function mossIndexerPlugin(
  siteConfig: SiteConfig<DefaultTheme.Config>
): Promise<Plugin> {
  // Only enable when Moss search provider is configured
  if (siteConfig.site.themeConfig?.search?.provider !== 'moss') {
    return {
      name: 'vitepress:moss-indexer'
    }
  }

  return {
    name: 'vitepress:moss-indexer',
    apply: 'build',
    async buildEnd() {
      // Only run for client build (VitePress builds both client and server bundles)
      if (this.environment.name !== 'client') return
      try {
        debug('Starting Moss index sync...')

        const searchConfig = siteConfig.site.themeConfig?.search
        const searchOptions = searchConfig?.provider === 'moss' ? searchConfig.options : undefined

        // Get credentials from config options only
        const projectId = searchOptions?.projectId
        const projectKey = searchOptions?.projectKey
        const indexName = searchOptions?.indexName

        // Validate required credentials
        if (!projectId || !projectKey || !indexName) {
          throw new Error(
            'Missing Moss configuration: projectId, projectKey, and indexName must be provided in themeConfig.search.options. ' +
            'Example: search: { provider: "moss", options: { projectId: "...", projectKey: "...", indexName: "..." } }'
          )
        }

        const creds = {
          projectId,
          projectKey,
          indexName
        }

        await sync({ 
          root: siteConfig.srcDir,
          creds 
        })

        debug('✅ Moss index sync completed.')
      } catch (error) {
        const err = error as Error
        // Do not fail the docs build if indexing fails; just log it.
        siteConfig.logger.error(
          `Moss index sync failed: ${err.message}\n` +
            'The documentation build will continue without an updated Moss index.'
        )
        debug('Moss index sync error', err)
      }
    }
  }
}
