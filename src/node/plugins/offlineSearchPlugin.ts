import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import MiniSearch from 'minisearch'
import fs from 'fs-extra'
import _debug from 'debug'
import type { SiteConfig } from '../config'
import { createMarkdownRenderer } from '../markdown/markdown.js'
import { resolveSiteDataByRoute } from '../shared.js'

const debug = _debug('vitepress:offline-search')

const OFFLINE_SEARCH_INDEX_ID = '@offlineSearchIndex'
const OFFLINE_SEARCH_INDEX_REQUEST_PATH = '/' + OFFLINE_SEARCH_INDEX_ID

interface IndexObject {
  id: string
  text: string
  title: string
  titles: string[]
}

export async function offlineSearchPlugin(
  siteConfig: SiteConfig
): Promise<Plugin> {
  if (
    siteConfig.userConfig.themeConfig?.algolia ||
    !siteConfig.userConfig.themeConfig?.offlineSearch
  ) {
    return {
      name: 'vitepress:offline-search',
      resolveId(id) {
        if (id.startsWith(OFFLINE_SEARCH_INDEX_ID)) {
          return `/${id}`
        }
      },
      load(id) {
        if (id.startsWith(OFFLINE_SEARCH_INDEX_REQUEST_PATH)) {
          return `export default '{}'`
        }
      }
    }
  }

  const md = await createMarkdownRenderer(
    siteConfig.srcDir,
    siteConfig.userConfig.markdown,
    siteConfig.userConfig.base,
    siteConfig.logger
  )

  const indexByLocales = new Map<string, MiniSearch<IndexObject>>()

  function getIndexByLocale(locale: string) {
    let index = indexByLocales.get(locale)
    if (!index) {
      index = new MiniSearch<IndexObject>({
        fields: ['title', 'titles', 'text'],
        storeFields: ['title', 'titles']
      })
      indexByLocales.set(locale, index)
    }
    return index
  }

  function getLocaleForPath(file: string) {
    const relativePath = path.relative(siteConfig.srcDir, file)
    const siteData = resolveSiteDataByRoute(siteConfig.site, relativePath)
    return siteData?.localeIndex ?? 'root'
  }

  function getIndexForPath(file: string) {
    const locale = getLocaleForPath(file)
    return getIndexByLocale(locale)
  }

  let server: ViteDevServer | undefined

  async function onIndexUpdated() {
    if (server) {
      server.moduleGraph.onFileChange(OFFLINE_SEARCH_INDEX_REQUEST_PATH)
      // HMR
      const mod = server.moduleGraph.getModuleById(
        OFFLINE_SEARCH_INDEX_REQUEST_PATH
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
    let id = file.replace(siteConfig.srcDir, siteConfig.userConfig.base ?? '')
    id = id.replace(/\.md$/, siteConfig.cleanUrls ? '' : '.html')
    return id
  }

  async function indexAllFiles(files: string[]) {
    const documentsByLocale = new Map<string, IndexObject[]>()
    await Promise.all(
      files
        .filter((file) => fs.existsSync(file))
        .map(async (file) => {
          const fileId = getDocId(file)
          const sections = splitPageIntoSections(
            await md.render(await fs.readFile(file, 'utf-8'))
          )
          const locale = getLocaleForPath(file)
          let documents = documentsByLocale.get(locale)
          if (!documents) {
            documents = []
            documentsByLocale.set(locale, documents)
          }
          documents.push(
            ...sections.map((section) => ({
              id: `${fileId}#${section.anchor}`,
              text: section.text,
              title: section.titles.at(-1)!,
              titles: section.titles.slice(0, -1)
            }))
          )
        })
    )
    for (const [locale, documents] of documentsByLocale) {
      const index = getIndexByLocale(locale)
      index.removeAll()
      await index.addAllAsync(documents)
    }
    debug(`🔍️ Indexed ${files.length} files`)
  }

  async function scanForBuild() {
    await indexAllFiles(
      siteConfig.pages.map((f) => path.join(siteConfig.srcDir, f))
    )
  }

  return {
    name: 'vitepress:offline-search',

    configureServer(_server) {
      server = _server

      server.watcher.on('ready', async () => {
        const watched = server!.watcher.getWatched()
        const files = Object.keys(watched).reduce((acc, dir) => {
          acc.push(
            ...watched[dir]
              .map((file) => dir + '/' + file)
              .filter((file) => file.endsWith('.md'))
          )
          return acc
        }, [] as string[])
        await indexAllFiles(files)
        onIndexUpdated()
      })
    },

    resolveId(id) {
      if (id.startsWith(OFFLINE_SEARCH_INDEX_ID)) {
        return `/${id}`
      }
    },

    async load(id) {
      if (id === OFFLINE_SEARCH_INDEX_REQUEST_PATH) {
        if (process.env.NODE_ENV === 'production') {
          await scanForBuild()
        }
        let records: string[] = []
        for (const [locale] of indexByLocales) {
          records.push(
            `${JSON.stringify(
              locale
            )}: () => import('@offlineSearchIndex${locale}')`
          )
        }
        return `export default {${records.join(',')}}`
      } else if (id.startsWith(OFFLINE_SEARCH_INDEX_REQUEST_PATH)) {
        return `export default ${JSON.stringify(
          JSON.stringify(
            indexByLocales.get(
              id.replace(OFFLINE_SEARCH_INDEX_REQUEST_PATH, '')
            ) ?? {}
          )
        )}`
      }
    },

    async handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.md')) {
        const fileId = getDocId(ctx.file)
        if (!fs.existsSync(ctx.file)) {
          return
        }
        const index = getIndexForPath(ctx.file)
        const sections = splitPageIntoSections(
          await md.render(await fs.readFile(ctx.file, 'utf-8'))
        )
        for (const section of sections) {
          const id = `${fileId}#${section.anchor}`
          if (index.has(id)) {
            index.discard(id)
          }
          index.add({
            id,
            text: section.text,
            title: section.titles.at(-1)!,
            titles: section.titles.slice(0, -1)
          })
        }
        debug('🔍️ Updated', ctx.file)

        onIndexUpdated()
      }
    }
  }
}

const headingRegex = /<h(\d*).*?>(.*?<a.*? href="#.*?".*?>.*?<\/a>)<\/h\1>/gi
const headingContentRegex = /(.*?)<a.*? href="#(.*?)".*?>.*?<\/a>/i

interface PageSection {
  anchor: string
  titles: string[]
  text: string
}

/**
 * Splits HTML into sections based on headings
 */
function splitPageIntoSections(html: string) {
  const result = html.split(headingRegex)
  result.shift()
  let parentTitles: string[] = []
  const sections: PageSection[] = []
  for (let i = 0; i < result.length; i += 3) {
    const level = parseInt(result[i]) - 1
    const heading = result[i + 1]
    const headingResult = headingContentRegex.exec(heading)
    const title = clearHtmlTags(headingResult?.[1] ?? '').trim()
    const anchor = headingResult?.[2] ?? ''
    const content = result[i + 2]
    if (!title || !content) continue
    const titles = [...parentTitles]
    titles[level] = title
    sections.push({ anchor, titles, text: getSearchableText(content) })
    if (level === 0) {
      parentTitles = [title]
    } else {
      parentTitles[level] = title
    }
  }
  return sections
}

function getSearchableText(content: string) {
  content = clearHtmlTags(content)
  return content
}

function clearHtmlTags(str: string) {
  return str.replace(/<[^>]*>/g, '')
}
