import _debug from 'debug'
import fs from 'fs-extra'
import MiniSearch from 'minisearch'
import pMap from 'p-map'
import path from 'path'
import type { Plugin, ViteDevServer } from 'vite'
import type { SiteConfig } from '../config'
import { createMarkdownRenderer } from '../markdown/markdown'
import {
  resolveSiteDataByRoute,
  slash,
  type DefaultTheme,
  type MarkdownEnv,
  type Awaitable
} from '../shared'
import { processIncludes } from '../utils/processIncludes'
import { updateCurrentTask, clearLine } from '../utils/task'
import type { PageSplitSection } from '../../../types/local-search'

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
    if (options._render) return await options._render(md_src, env, md)
    else {
      const html = md.render(md_src, env)
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

  function getLocaleForPath(file: string) {
    const relativePath = slash(path.relative(siteConfig.srcDir, file))
    const siteData = resolveSiteDataByRoute(siteConfig.site, relativePath)
    return siteData?.localeIndex ?? 'root'
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

  function scanForLocales() {
    for (const page of siteConfig.pages) {
      const file = path.join(siteConfig.srcDir, page)
      const locale = getLocaleForPath(file)
      // dry-fetch the index for this locale
      getIndexByLocale(locale)
    }
  }

  async function indexFile(page: string, parallel: boolean = false) {
    const file = path.join(siteConfig.srcDir, page)
    // get file metadata
    const fileId = getDocId(file)
    const locale = getLocaleForPath(file)
    const index = getIndexByLocale(locale)
    // retrieve file and split into "sections"
    const html = await render(file)
    const sections =
      // user provided generator
      (await options.miniSearch?._splitIntoSections?.(file, html)) ??
      // default implementation (parallel)
      (parallel ? parallelSplitter(html, fileId) : undefined) ??
      // default implementation
      splitPageIntoSections(html, fileId)
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

  async function indexAll() {
    const concurrency = siteConfig.concurrency
    let numIndexed = 0

    const updateProgress = () =>
      updateCurrentTask(
        ++numIndexed,
        siteConfig.pages.length,
        'indexing local search'
      )

    const parallel = shouldUseParallel(siteConfig, 'local-search')

    await pMap(
      siteConfig.pages,
      (page) => indexFile(page, parallel).then(updateProgress),
      { concurrency }
    )

    updateCurrentTask()
  }

  let indexAllPromise: Promise<void> | undefined

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
      onIndexUpdated()
    },

    resolveId(id) {
      if (id.startsWith(LOCAL_SEARCH_INDEX_ID)) {
        return `/${id}`
      }
    },

    async load(id) {
      if (id === LOCAL_SEARCH_INDEX_REQUEST_PATH) {
        scanForLocales()
        let records: string[] = []
        for (const [locale] of indexByLocales) {
          records.push(
            `${JSON.stringify(
              locale
            )}: () => import('${LOCAL_SEARCH_INDEX_ID}-${locale}')`
          )
        }
        return `export default {${records.join(',')}}`
      } else if (id.startsWith(LOCAL_SEARCH_INDEX_REQUEST_PATH)) {
        const locale = id.slice(LOCAL_SEARCH_INDEX_REQUEST_PATH.length + 1)
        await (indexAllPromise ??= indexAll())
        return `export default ${JSON.stringify(
          JSON.stringify(indexByLocales.get(locale) ?? {})
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

async function* splitPageIntoSections(
  html: string,
  pageName: string = 'Unknown Document'
) {
  const { JSDOM } = await import('jsdom')
  const { default: traverse, Node } = await import('dom-traverse')
  const dom = JSDOM.fragment(html)
  // Stack of title hierarchy for current working section
  const titleStack: Array<{ level: number; text: string }> = []
  // Set of all used ids (for duplicate id detection)
  const existingIdSet = new Set()
  // Current working section
  let section: PageSplitSection = { text: '', titles: [''] }
  // Traverse the DOM
  for (const [node, skipChildren] of traverse.skippable(dom)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      if (!/^H\d+$/i.test(el.tagName)) continue
      if (!el.hasAttribute('id')) continue
      const id = el.getAttribute('id')!
      // Skip duplicate id, content will be treated as normal text
      if (existingIdSet.has(id)) {
        console.error(
          `${clearLine}⚠️  Duplicate heading id "${id}" in ${pageName}`
        )
        continue
      }
      existingIdSet.add(id)
      // Submit previous section
      if (section.text || section.anchor) yield section
      // Pop adjacent titles depending on level
      const level = parseInt(el.tagName.slice(1))
      while (titleStack.length > 0) {
        if (titleStack.at(-1)!.level >= level) titleStack.pop()
        else break
      }
      titleStack.push({ level, text: el.textContent ?? '' })
      // Create new section
      section = {
        text: '',
        anchor: id,
        titles: titleStack.map((_) => _.text)
      }
      skipChildren()
    } else if (node.nodeType === Node.TEXT_NODE) {
      // Collect text content
      section.text += node.textContent
    }
  }
  // Submit last section
  yield section
}

/*=============================== Worker API ===============================*/
import { registerWorkload, shouldUseParallel } from '../worker'
import Queue from '../utils/queue'

// Worker proxy (worker thread)
const dispatchPageSplitWork = registerWorkload(
  'local-search:split',
  async (
    html: string,
    fileId: string,
    _yield: (section: PageSplitSection) => Awaitable<void>,
    _end: () => Awaitable<void>
  ) => {
    for await (const section of splitPageIntoSections(html, fileId)) {
      await _yield(section)
    }
    await _end()
  }
)

// Worker proxy (main thread)
function parallelSplitter(html: string, fileId: string) {
  const queue = new Queue<PageSplitSection>()
  dispatchPageSplitWork(
    html,
    fileId,
    queue.enqueue.bind(queue),
    queue.close.bind(queue)
  )
  return queue.items()
}
