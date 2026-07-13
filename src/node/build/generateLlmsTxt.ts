import matter from 'gray-matter'
import fs from 'node:fs/promises'
import path from 'node:path'
import pMap from 'p-map'
import type { SiteConfig } from '../config'
import type { DefaultTheme } from '../defaultTheme'
import type { MarkdownRenderer } from '../markdown/markdown'
import { createMarkdownRenderer } from '../markdown/markdown'
import { processIncludes } from '../utils/processIncludes'
import { task } from '../utils/task'

export interface LlmsOptions {
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

const includesRE = /<!--\s*@include:/
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
  let out = ''

  for (const item of items) {
    const base = item.base ?? linkBase

    if (typeof item.link === 'string') {
      const page = pagesByKey.get(normalizeLink(base + item.link))
      if (page && !ordered.includes(page)) {
        ordered.push(page)
        out += tocEntry(page)
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
        out += item.text
          ? `\n${'#'.repeat(depth)} ${item.text}\n\n${section}`
          : section
      }
    }
  }

  return out
}

function tocEntry(page: LlmsPage): string {
  return `- [${page.title}](${page.link})${
    page.description ? `: ${page.description}` : ''
  }\n`
}

export async function generateLlmsTxt(siteConfig: SiteConfig) {
  if (!siteConfig.llms) return

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

  await task('generating llms.txt', async () => {
    // lazily created — only needed when a page uses `<!-- @include -->`
    let md: MarkdownRenderer | undefined
    const getMd = async () =>
      (md ??= await createMarkdownRenderer(
        siteConfig.srcDir,
        siteConfig.markdown,
        siteConfig.site.base,
        siteConfig.logger
      ))

    let indexFrontmatter: Record<string, any> = {}

    const pages = (
      await pMap(
        siteConfig.pages,
        async (page): Promise<LlmsPage | undefined> => {
          if (dynamicPaths.has(page)) return
          if (skippedLocaleDirs.has(page.split('/')[0])) return

          const srcPath = path.join(siteConfig.srcDir, page)
          const { data, content: rawContent } = matter(
            await fs.readFile(srcPath, 'utf-8')
          )

          if (page === 'index.md') {
            // the landing page provides llms.txt metadata but is not emitted
            indexFrontmatter = data
            return
          }

          let content = rawContent
          if (includesRE.test(content)) {
            content = processIncludes(
              await getMd(),
              siteConfig.srcDir,
              content,
              srcPath,
              [],
              !!siteConfig.cleanUrls
            )
          }

          const outPath = collapseIndexPath(
            siteConfig.rewrites.map[page] || page
          )

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

    // llms.txt — TOC in sidebar order when a sidebar exists
    const pagesByKey = new Map(
      pages.map((page) => [normalizeLink(page.outPath), page])
    )
    const sidebar = flattenSidebar(
      (siteConfig.site.themeConfig as DefaultTheme.Config | undefined)?.sidebar,
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

    const title =
      options.title ?? indexFrontmatter.hero?.name ?? siteConfig.site.title
    const description =
      options.description ??
      indexFrontmatter.hero?.text ??
      siteConfig.site.description

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
