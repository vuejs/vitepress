import _debug from 'debug'
import fs from 'fs-extra'
import MiniSearch from 'minisearch'
import path from 'node:path'
import pMap from 'p-map'
import type { Plugin, ViteDevServer } from 'vite'
import type { SiteConfig } from '../config'
import type { DefaultTheme } from '../defaultTheme'
import { createMarkdownRenderer } from '../markdown/markdown'
import { getLocaleForPath, slash, type MarkdownEnv } from '../shared'
import { processIncludes } from '../utils/processIncludes'

const debug = _debug('vitepress:local-search')

const LOCAL_SEARCH_INDEX_ID = '@localSearchIndex'
const LOCAL_SEARCH_INDEX_REQUEST_PATH = '/' + LOCAL_SEARCH_INDEX_ID

interface IndexObject {
  id: string
  text: string
  title: string
  titles: string[]
}

export async function localSearchPlugin(
  siteConfig: SiteConfig<DefaultTheme.Config>
): Promise<Plugin> {
  if (siteConfig.site.themeConfig?.search?.provider !== 'local') {
    return {
      name: 'vitepress:local-search',
      resolveId(id) {
        if (id.startsWith(LOCAL_SEARCH_INDEX_ID)) {
          return `/${id}`
        }
      },
      load(id) {
        if (id.startsWith(LOCAL_SEARCH_INDEX_REQUEST_PATH)) {
          return `export default '{}'`
        }
      }
    }
  }

  const md = await createMarkdownRenderer(
    siteConfig.srcDir,
    siteConfig.markdown,
    siteConfig.site.base,
    siteConfig.logger
  )

  const options = siteConfig.site.themeConfig.search.options || {}

  async function render(file: string) {
    if (!fs.existsSync(file)) return ''
    const { srcDir, cleanUrls = false } = siteConfig
    const relativePath = slash(path.relative(srcDir, file))
    const env: MarkdownEnv = { path: file, relativePath, cleanUrls }
    const md_raw = await fs.promises.readFile(file, 'utf-8')
    const md_src = processIncludes(srcDir, md_raw, file, [])
    if (options._render) {
      return await options._render(md_src, env, md)
    } else {
      const html = await md.renderAsync(md_src, env)
      return env.frontmatter?.search === false ? '' : html
    }
  }

  const indexByLocales = new Map<string, MiniSearch<IndexObject>>()

  function getIndexByLocale(locale: string) {
    let index = indexByLocales.get(locale)
    if (!index) {
      index = new MiniSearch<IndexObject>({
        fields: ['title', 'titles', 'text'],
        storeFields: ['title', 'titles'],
        ...options.miniSearch?.options
      })
      indexByLocales.set(locale, index)
    }
    return index
  }

  let server: ViteDevServer | undefined

  function onIndexUpdated() {
    if (server) {
      server.moduleGraph.onFileChange(LOCAL_SEARCH_INDEX_REQUEST_PATH)
      // HMR
      const mod = server.moduleGraph.getModuleById(
        LOCAL_SEARCH_INDEX_REQUEST_PATH
      )
      if (!mod) return
      server.ws.send({
        type: 'update',
        updates: [
          {
            acceptedPath: mod.url,
            path: mod.url,
            timestamp: Date.now(),
            type: 'js-update'
          }
        ]
      })
    }
  }

  function getDocId(file: string) {
    let relFile = slash(path.relative(siteConfig.srcDir, file))
    relFile = siteConfig.rewrites.map[relFile] || relFile
    let id = slash(path.join(siteConfig.site.base, relFile))
    id = id.replace(/(^|\/)index\.md$/, '$1')
    id = id.replace(/\.md$/, siteConfig.cleanUrls ? '' : '.html')
    return id
  }

  async function indexFile(page: string) {
    const file = path.join(siteConfig.srcDir, page)
    // get file metadata
    const fileId = getDocId(file)
    const locale = getLocaleForPath(siteConfig.site, page)
    const index = getIndexByLocale(locale)
    // retrieve file and split into "sections"
    const html = await render(file)
    const sections =
      // user provided generator
      (await options.miniSearch?._splitIntoSections?.(file, html)) ??
      // default implementation
      splitPageIntoSections(html)
    // add sections to the locale index
    for await (const section of sections) {
      if (!section || !(section.text || section.titles)) break
      const { anchor, text, titles } = section
      const id = anchor ? [fileId, anchor].join('#') : fileId
      index.add({
        id,
        text,
        title: titles.at(-1)!,
        titles: titles.slice(0, -1)
      })
    }
  }

  async function scanForBuild() {
    debug('🔍️ Indexing files for search...')
    await pMap(siteConfig.pages, indexFile, {
      concurrency: siteConfig.buildConcurrency
    })
    debug('✅ Indexing finished...')
  }

  return {
    name: 'vitepress:local-search',

    config: () => ({
      optimizeDeps: {
        include: [
          'vitepress > @vueuse/integrations/useFocusTrap',
          'vitepress > mark.js/src/vanilla.js',
          'vitepress > minisearch'
        ]
      }
    }),

    async configureServer(_server) {
      server = _server
      await scanForBuild()
      onIndexUpdated()
    },

    resolveId(id) {
      if (id.startsWith(LOCAL_SEARCH_INDEX_ID)) {
        return `/${id}`
      }
    },

    async load(id) {
      if (id === LOCAL_SEARCH_INDEX_REQUEST_PATH) {
        if (process.env.NODE_ENV === 'production') {
          await scanForBuild()
        }
        let records: string[] = []
        for (const [locale] of indexByLocales) {
          records.push(
            `${JSON.stringify(
              locale
            )}: () => import('@localSearchIndex${locale}')`
          )
        }
        return `export default {${records.join(',')}}`
      } else if (id.startsWith(LOCAL_SEARCH_INDEX_REQUEST_PATH)) {
        return `export default ${JSON.stringify(
          JSON.stringify(
            indexByLocales.get(
              id.replace(LOCAL_SEARCH_INDEX_REQUEST_PATH, '')
            ) ?? {}
          )
        )}`
      }
    },

    async handleHotUpdate({ file }) {
      if (file.endsWith('.md')) {
        await indexFile(file)
        debug('🔍️ Updated', file)
        onIndexUpdated()
      }
    }
  }
}

const headingRegex = /<h(\d*).*?>(.*?<a.*? href="#.*?".*?>.*?<\/a>)<\/h\1>/gi
const headingContentRegex = /(.*?)<a.*? href="#(.*?)".*?>.*?<\/a>/i

/**
 * Splits HTML into sections based on headings
 */
function* splitPageIntoSections(html: string) {
  const result = html.split(headingRegex)
  result.shift()
  let parentTitles: string[] = []
  for (let i = 0; i < result.length; i += 3) {
    const level = parseInt(result[i]) - 1
    const heading = result[i + 1]
    const headingResult = headingContentRegex.exec(heading)
    const title = clearHtmlTags(headingResult?.[1] ?? '').trim()
    const anchor = headingResult?.[2] ?? ''
    const content = result[i + 2]
    if (!title || !content) continue
    let titles = parentTitles.slice(0, level)
    titles[level] = title
    titles = titles.filter(Boolean)
    yield { anchor, titles, text: getSearchableText(content) }
    if (level === 0) {
      parentTitles = [title]
    } else {
      parentTitles[level] = title
    }
  }
}

function getSearchableText(content: string) {
  content = clearHtmlTags(content)
  return content
}

function clearHtmlTags(str: string) {
  return str.replace(/<[^>]*>/g, '')
}
