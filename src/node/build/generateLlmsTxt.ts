import matter from 'gray-matter'
import fs from 'node:fs/promises'
import path from 'node:path'
import pMap from 'p-map'
import picomatch from 'picomatch'
import type { SiteConfig } from '../config'
import type { DefaultTheme } from '../defaultTheme'
import { resolveSiteDataByRoute } from '../shared'
import { isLlmsEnabled, resolveLlmTags } from '../utils/llmTags'
import { task } from '../utils/task'

export interface LlmsOptions {
  /**
   * Whether to generate LLM output. Useful to keep the rest of the options
   * while toggling generation, e.g. only on CI.
   *
   * @default true
   */
  enabled?: boolean

  /**
   * Origin used to build absolute links (e.g. `https://example.com`).
   * Falls back to `sitemap.hostname`. Links are root-relative when absent.
   */
  hostname?: string

  /**
   * Title used in `llms.txt`.
   * Defaults to the index page's hero name, then the site title.
   */
  title?: string

  /**
   * Description used in `llms.txt`.
   * Defaults to the index page's hero text, then the site description.
   */
  description?: string

  /**
   * Glob patterns for pages to exclude from LLM output. Matched against
   * both the source path relative to `srcDir` (e.g. `en/guide/foo.md`) and
   * the rewritten output path (e.g. `guide/foo.md`).
   */
  ignoreFiles?: string[]
}

interface LlmsPage {
  /** output path of the emitted markdown file, relative to outDir */
  outPath: string
  /** absolute or root-relative link to the emitted markdown file */
  link: string
  title: string
  description?: string
  /** frontmatter-stripped, include-expanded markdown */
  content: string
}

/**
 * Include-expanded markdown sources collected during the markdown → Vue
 * transform, keyed by source path relative to `srcDir` (pre-rewrite, as in
 * `siteConfig.pages`). Collected before llm tags are stripped for the HTML
 * build so `generateLlmsTxt` doesn't have to re-read and re-process pages.
 */
const collectedSources = new WeakMap<SiteConfig, Map<string, string>>()

export function collectLlmsSource(
  siteConfig: SiteConfig,
  file: string,
  src: string
): void {
  let sources = collectedSources.get(siteConfig)
  if (!sources) collectedSources.set(siteConfig, (sources = new Map()))
  sources.set(file, src)
}

export function getLlmsSources(
  siteConfig: SiteConfig
): ReadonlyMap<string, string> | undefined {
  return collectedSources.get(siteConfig)
}

const headingRE = /^#\s+(.+?)\s*$/m

function inferTitle(
  frontmatter: Record<string, any>,
  content: string,
  fallback: string
): string {
  if (typeof frontmatter.title === 'string') return frontmatter.title
  if (typeof frontmatter.hero?.name === 'string') return frontmatter.hero.name
  const heading = headingRE.exec(content)?.[1]
  if (heading) {
    return heading
      .replace(/\{#[^}]+\}\s*$/, '') // custom anchor
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links
      .replace(/<[^>]+>/g, '') // html tags
      .replace(/[`*]/g, '')
      .trim()
  }
  return fallback
}

/** `guide/index.md` is emitted as `guide.md`, mirroring clean page URLs */
function collapseIndexPath(outPath: string): string {
  return outPath !== 'index.md' && outPath.endsWith('/index.md')
    ? `${outPath.slice(0, -'/index.md'.length)}.md`
    : outPath
}

/** frontmatter for emitted files — JSON strings are valid YAML scalars */
function pageFrontmatter(page: LlmsPage): string {
  const lines = ['---', `url: ${JSON.stringify(page.link)}`]
  if (page.description) {
    lines.push(`description: ${JSON.stringify(page.description)}`)
  }
  lines.push('---', '')
  return lines.join('\n')
}

/**
 * Normalizes a sidebar link to the lookup key used for matching pages:
 * no leading slash, no `.md`/`.html` extension, no trailing `/index`.
 */
function normalizeLink(link: string): string {
  return link
    .replace(/^\//, '')
    .replace(/\.(md|html)$/, '')
    .replace(/\/$/, '/index')
    .replace(/(^|\/)index$/, '$1')
    .replace(/\/$/, '')
}

function flattenSidebar(
  sidebar: DefaultTheme.Sidebar | undefined,
  skippedLocaleDirs: Set<string>
): DefaultTheme.SidebarItem[] {
  if (!sidebar) return []
  if (Array.isArray(sidebar)) return sidebar

  return Object.entries(sidebar)
    .filter(([key]) => {
      const dir = key.replace(/^\//, '').split('/')[0]
      return !skippedLocaleDirs.has(dir)
    })
    .flatMap(([, group]) =>
      Array.isArray(group)
        ? group
        : group.items.map((item) => ({ base: group.base, ...item }))
    )
}

function renderSidebarItems(
  items: DefaultTheme.SidebarItem[],
  pagesByKey: Map<string, LlmsPage>,
  ordered: LlmsPage[],
  linkBase: string,
  depth: number
): string {
  // leaf links come before nested sections so they are not
  // misattributed to the previous section's heading
  let links = ''
  let sections = ''

  for (const item of items) {
    const base = item.base ?? linkBase

    if (typeof item.link === 'string') {
      const page = pagesByKey.get(normalizeLink(base + item.link))
      if (page && !ordered.includes(page)) {
        ordered.push(page)
        links += tocEntry(page)
      }
    }

    if (item.items?.length) {
      const section = renderSidebarItems(
        item.items,
        pagesByKey,
        ordered,
        base,
        depth + 1
      )
      if (section) {
        sections += item.text
          ? `\n${'#'.repeat(depth)} ${item.text}\n\n${section}`
          : section
      }
    }
  }

  return links + sections
}

function tocEntry(page: LlmsPage): string {
  return `- [${page.title}](${page.link})${
    page.description ? `: ${page.description}` : ''
  }\n`
}

export async function generateLlmsTxt(siteConfig: SiteConfig) {
  if (!isLlmsEnabled(siteConfig.llms)) return

  const options: LlmsOptions = siteConfig.llms === true ? {} : siteConfig.llms

  const hostname = options.hostname ?? siteConfig.sitemap?.hostname
  const origin = hostname?.replace(/\/$/, '') ?? ''
  const base = siteConfig.site.base

  // only the root locale is emitted — LLMs don't need translations
  const skippedLocaleDirs = new Set(
    Object.keys(siteConfig.userConfig.locales ?? {}).filter(
      (key) => key !== 'root'
    )
  )
  const dynamicPaths = new Set(siteConfig.dynamicRoutes.map((r) => r.path))
  const isIgnored = options.ignoreFiles?.length
    ? picomatch(options.ignoreFiles)
    : undefined

  await task('generating llms.txt', async () => {
    const sources = getLlmsSources(siteConfig)

    let indexFrontmatter: Record<string, any> = {}

    const pages = (
      await pMap(
        siteConfig.pages,
        async (page): Promise<LlmsPage | undefined> => {
          if (dynamicPaths.has(page)) return
          if (skippedLocaleDirs.has(page.split('/')[0])) return

          // collected during the markdown → Vue transform with includes
          // already expanded; the fs fallback only covers pages that never
          // went through the bundle (should not happen in practice)
          const src =
            sources?.get(page) ??
            (await fs.readFile(path.join(siteConfig.srcDir, page), 'utf-8'))
          const { data, content: rawContent } = matter(src)

          const outPath = collapseIndexPath(
            siteConfig.rewrites.map[page] || page
          )

          if (outPath === 'index.md') {
            // the landing page provides llms.txt metadata but is not emitted
            indexFrontmatter = data
            return
          }

          if (isIgnored?.(page) || isIgnored?.(outPath)) return

          const content = resolveLlmTags(rawContent)

          return {
            outPath,
            link: `${origin}${base}${outPath}`,
            title: inferTitle(data, content, outPath.replace(/\.md$/, '')),
            description:
              typeof data.description === 'string'
                ? data.description
                : undefined,
            content: content.trim()
          }
        },
        { concurrency: siteConfig.buildConcurrency }
      )
    ).filter((page) => page !== undefined)

    // per-page markdown files
    await pMap(
      pages,
      async (page) => {
        const outFile = path.join(siteConfig.outDir, page.outPath)
        await fs.mkdir(path.dirname(outFile), { recursive: true })
        await fs.writeFile(
          outFile,
          `${pageFrontmatter(page)}\n${page.content}\n`
        )
      },
      { concurrency: siteConfig.buildConcurrency }
    )

    // llms.txt — TOC in sidebar order when a sidebar exists.
    // resolve site data for the root index so locale and additional
    // config layers (e.g. a root-level config.ts) are taken into account
    const rootSite = resolveSiteDataByRoute(siteConfig.site, 'index.md')
    const pagesByKey = new Map(
      pages.map((page) => [normalizeLink(page.outPath), page])
    )
    const sidebar = flattenSidebar(
      (rootSite.themeConfig as DefaultTheme.Config | undefined)?.sidebar,
      skippedLocaleDirs
    )

    const ordered: LlmsPage[] = []
    let toc = renderSidebarItems(sidebar, pagesByKey, ordered, '', 3).trim()

    const unlisted = pages.filter((page) => !ordered.includes(page))
    ordered.push(...unlisted)
    if (unlisted.length) {
      const entries = unlisted.map(tocEntry).join('')
      toc += toc ? `\n\n### Other\n\n${entries}` : entries
    }

    const title = options.title ?? indexFrontmatter.hero?.name ?? rootSite.title
    const description =
      options.description ?? indexFrontmatter.hero?.text ?? rootSite.description

    const llmsTxt = `# ${title}\n\n${
      description ? `> ${description}\n\n` : ''
    }## Table of Contents\n\n${toc.trim()}\n`

    await fs.writeFile(path.join(siteConfig.outDir, 'llms.txt'), llmsTxt)

    // llms-full.txt — every page in TOC order
    const llmsFullTxt = ordered
      .map((page) => `${pageFrontmatter(page)}\n${page.content}\n`)
      .join('\n')

    await fs.writeFile(
      path.join(siteConfig.outDir, 'llms-full.txt'),
      llmsFullTxt
    )
  })
}
