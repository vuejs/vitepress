import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import MiniSearch from 'minisearch'
import fs from 'fs-extra'
import _debug from 'debug'
import type { SiteConfig } from '../config'
import { createMarkdownRenderer } from '../markdown/markdown.js'

const debug = _debug('vitepress:offline-search')

const OFFLINE_SEARCH_INDEX_ID = '@offlineSearchIndex'
const OFFLINE_SEARCH_INDEX_REQUEST_PATH = '/' + OFFLINE_SEARCH_INDEX_ID

interface IndexObject {
  id: string
  text: string
  titles: string[]
}

export async function offlineSearchPlugin(
  siteConfig: SiteConfig
): Promise<Plugin> {
  if (siteConfig.userConfig.themeConfig?.algolia || siteConfig.userConfig.themeConfig?.search === false) {
    return {
      name: 'vitepress:offline-search',
      resolveId(id) {
        if (id === OFFLINE_SEARCH_INDEX_ID) {
          return OFFLINE_SEARCH_INDEX_REQUEST_PATH
        }
      },
      load(id) {
        if (id === OFFLINE_SEARCH_INDEX_REQUEST_PATH) {
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

  const index = new MiniSearch<IndexObject>({
    fields: ['text'],
    storeFields: ['titles']
  })

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
    const documents = await Promise.all(
      files.filter((file) => fs.existsSync(file)).map(async (file) => {
        const fileId = getDocId(file)
        const sections = splitPageIntoSections(
          await md.render(await fs.readFile(file, 'utf-8'))
        )
        return sections.map((section) => ({
          id: `${fileId}#${section.anchor}`,
          text: section.text,
          titles: section.titles
        }))
      })
    )
    await index.addAllAsync(documents.flat())
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
      if (id === OFFLINE_SEARCH_INDEX_ID) {
        return OFFLINE_SEARCH_INDEX_REQUEST_PATH
      }
    },

    async load(id) {
      if (id === OFFLINE_SEARCH_INDEX_REQUEST_PATH) {
        if (process.env.NODE_ENV === 'production') {
          await scanForBuild()
        }
        return `export default ${JSON.stringify(JSON.stringify(index))}`
      }
    },

    async handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.md')) {
        const fileId = getDocId(ctx.file)
        if (!fs.existsSync(ctx.file)) {
          return
        }
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
            titles: section.titles
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
