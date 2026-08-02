import { normalizePath, type Plugin, type RenderBuiltAssetUrl } from 'vite'
import type { SiteConfig } from '../../config'
import { slash } from '../../shared'

export type ClientAssetMap = Record<string, string>

const builtAssetRE = /__VITE_ASSET__([\w$]+)__(?:\$_(.*?)__)?/
const publicAssetRE = /__VITE_PUBLIC_ASSET__[a-z\d]{8}__/
const rawQueryRE = /(?:\?|&)raw(?:&|$)/

function encodeURIPath(uri: string): string {
  if (uri.startsWith('data:')) return uri
  const postfixIndex = uri.search(/[?#]/)
  const filePath = postfixIndex < 0 ? uri : uri.slice(0, postfixIndex)
  const postfix = postfixIndex < 0 ? '' : uri.slice(postfixIndex)
  return encodeURI(filePath) + postfix
}

function removeUrlQuery(url: string): string {
  return url.replace(/(\?|&)url(?:&|$)/, '$1').replace(/[?&]$/, '')
}

/** @internal Exported for focused pipeline tests. */
export function captureClientAssetUrls(
  config: { site: Pick<SiteConfig['site'], 'base'> },
  assetMap: ClientAssetMap
): Plugin {
  const pending = new Map<
    string,
    | { type: 'asset'; referenceId: string; postfix: string }
    | { type: 'public'; url: string }
  >()
  let renderBuiltUrl: RenderBuiltAssetUrl | undefined

  const resolveBuiltUrl = (
    filename: string,
    type: 'asset' | 'public',
    hostId: string
  ) => {
    const custom = renderBuiltUrl?.(filename, {
      type,
      hostId,
      hostType: 'js',
      // SSR uses these URLs, but they must identify files from the client
      // build.
      ssr: true
    })
    if (typeof custom === 'string') {
      if (custom) return custom
    } else if (custom?.runtime) {
      throw new Error(
        `ssrBuildBatchSize cannot materialize the runtime renderBuiltUrl expression for ${filename}. Return a URL string for SSR assets instead.`
      )
    }
    return slash(`${config.site.base}${filename.replace(/^\/+/, '')}`)
  }

  return {
    name: 'vitepress:ssr-client-asset-map',
    enforce: 'post',
    configResolved(resolved) {
      renderBuiltUrl = resolved.experimental.renderBuiltUrl
    },
    transform: {
      // Rolldown applies this filter without a JavaScript hook call. This
      // avoids calls for the app, Markdown pages, and Vue components.
      filter: {
        id: {
          exclude:
            /\.(?:[cm]?[jt]s|vue)(?:$|\?(?!url(?:&|#|$))(?![^#]*&url(?:&|#|$)))/
        }
      },
      handler(code, id) {
        const match = /^export default ("(?:[^"\\]|\\.)*")\s*;?\s*$/.exec(code)
        if (!match) return

        const value = JSON.parse(match[1]) as string
        const asset = builtAssetRE.exec(value)
        if (asset) {
          pending.set(normalizePath(id), {
            type: 'asset',
            referenceId: asset[1],
            // Vite preserves the query and hash postfix. Do not decode it
            // because `%` can be a literal character.
            postfix: asset[2] || ''
          })
        } else if (publicAssetRE.test(value)) {
          // An unbundled SSR environment otherwise returns a development URL.
          // Use the final client URL and remove only the `?url` control query.
          pending.set(normalizePath(id), {
            type: 'public',
            url: removeUrlQuery(id)
          })
        } else if (value.startsWith('data:') && !rawQueryRE.test(id)) {
          assetMap[normalizePath(id)] = value
        }
      }
    },
    generateBundle(_options, bundle) {
      const moduleHosts = new Map<string, string>()
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        for (const moduleId of output.moduleIds) {
          const normalizedId = normalizePath(moduleId)
          if (!moduleHosts.has(normalizedId)) {
            moduleHosts.set(normalizedId, output.fileName)
          }
        }
      }

      for (const [id, asset] of pending) {
        const hostId = moduleHosts.get(id) ?? id
        const filename =
          asset.type === 'asset'
            ? `${this.getFileName(asset.referenceId)}${asset.postfix}`
            : asset.url.replace(/^\/+/, '')
        assetMap[id] = encodeURIPath(
          resolveBuiltUrl(filename, asset.type, hostId)
        )
      }
    }
  }
}

export function useClientAssetUrlsForSsr(assetMap: ClientAssetMap): Plugin {
  return {
    name: 'vitepress:ssr-client-asset-urls',
    enforce: 'pre',
    load(id) {
      // `load` and the client capture pass use the fully resolved ID. Handle it
      // here to avoid a second resolution and allow earlier custom loaders.
      const assetUrl = assetMap[normalizePath(id)]
      if (assetUrl === undefined) return
      return {
        code: `export default ${JSON.stringify(assetUrl)}`,
        moduleType: 'js'
      }
    }
  }
}
