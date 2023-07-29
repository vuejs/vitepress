import _debug from 'debug'
import fs from 'fs-extra'
import MiniSearch from 'minisearch'
import path from 'path'
import type { Plugin, ViteDevServer } from 'vite'
import type { SiteConfig } from '../config'
import { createMarkdownRenderer, type MarkdownEnv } from '../markdown'
import { resolveSiteDataByRoute, slash, type DefaultTheme } from '../shared'

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

  function render(file: string) {
    const { srcDir, cleanUrls = false, site } = siteConfig
    const relativePath = slash(path.relative(srcDir, file))
    const env: MarkdownEnv = {
      path: file,
      relativePath,
      cleanUrls
    }
    const html = md.render(fs.readFileSync(file, 'utf-8'), env)
    if (
      env.frontmatter?.search === false ||
      (site.themeConfig.search?.provider === 'local' &&
        site.themeConfig.search.options?.exclude?.(relativePath))
    ) {
      return ''
    }
    return html
  }

  const indexByLocales = new Map<string, MiniSearch<IndexObject>>()

  function getIndexByLocale(locale: string) {
    let index = indexByLocales.get(locale)
    if (!index) {
      index = new MiniSearch<IndexObject>({
        fields: ['title', 'titles', 'text'],
        storeFields: ['title', 'titles'],
        ...(siteConfig.site.themeConfig?.search?.provider === 'local' &&
          siteConfig.site.themeConfig.search.options?.miniSearch?.options)
      })
      indexByLocales.set(locale, index)
    }
    return index
  }

  function getLocaleForPath(file: string) {
    const relativePath = slash(path.relative(siteConfig.srcDir, file))
    const siteData = resolveSiteDataByRoute(siteConfig.site, relativePath)
    return siteData?.localeIndex ?? 'root'
  }

  function getIndexForPath(file: string) {
    const locale = getLocaleForPath(file)
    return getIndexByLocale(locale)
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

  async function indexAllFiles(files: string[]) {
    const documentsByLocale = new Map<string, IndexObject[]>()
    await Promise.all(
      files
        .filter((file) => fs.existsSync(file))
        .map(async (file) => {
          const fileId = getDocId(file)
          const sections = splitPageIntoSections(render(file))
          if (sections.length === 0) return
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
        const fileId = getDocId(file)
        if (!fs.existsSync(file)) return
        const index = getIndexForPath(file)
        const sections = splitPageIntoSections(render(file))
        if (sections.length === 0) return
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
        debug('🔍️ Updated', file)

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
    const titles = parentTitles.slice(0, level)
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
