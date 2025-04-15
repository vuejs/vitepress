import type { Plugin, ViteDevServer } from 'vite'

import fs from 'node:fs/promises'
import path from 'node:path'

import matter, { type Input } from 'gray-matter'
import { minimatch } from 'minimatch'
import pc from 'picocolors'
import { remark } from 'remark'
import remarkFrontmatter from 'remark-frontmatter'

import { remove } from 'unist-util-remove'

import { millify } from 'millify'
import { approximateTokenSize } from 'tokenx'
import { defaultLLMsTxtTemplate } from './constants'
import { generateLLMsFullTxt, generateLLMsTxt } from './helpers/index'
import log from './helpers/logger'
import {
  expandTemplate,
  extractTitle,
  generateMetadata,
  getHumanReadableSizeOf,
  stripExt
} from './helpers/utils'
import type {
  CustomTemplateVariables,
  LlmstxtSettings,
  PreparedFile,
  VitePressConfig
} from './types'

const PLUGIN_NAME = 'llmstxt'

/**
 * [VitePress](http://vitepress.dev/) plugin for generating raw documentation
 * for **LLMs** in Markdown format which is much lighter and more efficient for LLMs
 *
 * @param [userSettings={}] - Plugin settings.
 *
 * @see https://github.com/okineadev/vitepress-plugin-llms
 * @see https://llmstxt.org/
 */
export default function llmstxt(userSettings: LlmstxtSettings = {}): Plugin {
  // Create a settings object with defaults explicitly merged
  const settings: Omit<LlmstxtSettings, 'workDir'> & { workDir: string } = {
    generateLLMsTxt: true,
    generateLLMsFullTxt: true,
    generateLLMFriendlyDocsForEachPage: true,
    ignoreFiles: [],
    workDir: undefined as unknown as string,
    stripHTML: true,
    ...userSettings
  }

  // Store the resolved Vite config
  let config: VitePressConfig

  // Set to store all markdown file paths
  const mdFiles: Set<string> = new Set()

  // Flag to identify which build we're in
  let isSsrBuild = false

  return {
    name: PLUGIN_NAME,

    /** Resolves the Vite configuration and sets up the working directory. */
    configResolved(resolvedConfig) {
      config = resolvedConfig as VitePressConfig
      if (settings.workDir) {
        settings.workDir = path.resolve(
          config.vitepress.srcDir,
          settings.workDir as string
        )
      } else {
        settings.workDir = config.vitepress.srcDir
      }
      // Detect if this is the SSR build
      isSsrBuild = !!resolvedConfig.build?.ssr
      log.info(
        `${pc.bold(PLUGIN_NAME)} initialized ${isSsrBuild ? pc.dim('(SSR build)') : pc.dim('(client build)')} with workDir: ${pc.cyan(settings.workDir as string)}`
      )
    },

    /** Configures the development server to handle `llms.txt` and markdown files for LLMs. */
    async configureServer(server: ViteDevServer) {
      log.info('Dev server configured for serving plain text docs for LLMs')
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.endsWith('.md') || req.url?.endsWith('.txt')) {
          try {
            // Try to read and serve the markdown file
            const filePath = path.resolve(
              config.vitepress?.outDir ?? 'dist',
              `${stripExt(req.url)}.md`
            )
            const content = await fs.readFile(filePath, 'utf-8')
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.end(content)
            return
          } catch (e) {
            // If file doesn't exist or can't be read, continue to next middleware
            log.warn(`Failed to return ${pc.cyan(req.url)}: File not found`)
            next()
          }
        }

        // Pass to next middleware if not handled
        next()
      })
    },

    /**
     * Resets the collection of markdown files when the build starts.
     * This ensures we don't include stale data from previous builds.
     */
    buildStart() {
      mdFiles.clear()
      log.info('Build started, file collection cleared')
    },

    /**
     * Processes each file that Vite transforms and collects markdown files.
     *
     * @param _ - The file content (not used).
     * @param id - The file identifier (path).
     * @returns null if the file is processed, otherwise returns the original content.
     */
    async transform(_, id: string) {
      if (!id.endsWith('.md')) {
        return null
      }

      // Skip files outside workDir if it's configured
      if (!id.startsWith(settings.workDir as string)) {
        return null
      }

      if (settings.ignoreFiles?.length) {
        const shouldIgnore = await Promise.all(
          settings.ignoreFiles.map(async (pattern) => {
            if (typeof pattern === 'string') {
              return await Promise.resolve(
                minimatch(
                  path.relative(settings.workDir as string, id),
                  pattern
                )
              )
            }
            return false
          })
        )

        if (shouldIgnore.some((result) => result === true)) {
          return null
        }
      }

      // Add markdown file path to our collection
      mdFiles.add(id)
      // Return null to avoid modifying the file
      return null
    },

    /**
     * Runs only in the client build (not SSR) after completion.
     * This ensures the processing happens exactly once.
     */
    async generateBundle() {
      // Skip processing during SSR build
      if (isSsrBuild) {
        log.info('Skipping LLMs docs generation in SSR build')
        return
      }

      const outDir = config.vitepress?.outDir ?? 'dist'

      // Create output directory if it doesn't exist
      try {
        await fs.access(outDir)
      } catch {
        log.info(`Creating output directory: ${pc.cyan(outDir)}`)
        await fs.mkdir(outDir, { recursive: true })
      }

      const mdFilesList = Array.from(mdFiles)
      const fileCount = mdFilesList.length

      // Skip if no files found
      if (fileCount === 0) {
        log.warn(
          `No markdown files found to process. Check your \`${pc.bold('workDir')}\` and \`${pc.bold('ignoreFiles')}\` settings.`
        )
        return
      }

      log.info(
        `Processing ${pc.bold(fileCount.toString())} markdown files from ${pc.cyan(settings.workDir)}`
      )

      const preparedFiles: PreparedFile[] = await Promise.all(
        mdFilesList.map(async (file) => {
          const content = await fs.readFile(file, 'utf-8')

          let mdFile: matter.GrayMatterFile<Input>

          if (settings.stripHTML) {
            const cleanedMarkdown = await remark()
              .use(remarkFrontmatter)
              .use(() => {
                // Strip HTML tags
                return (tree) => {
                  remove(tree, { type: 'html' })
                  return tree
                }
              })
              .process(content)

            mdFile = matter(String(cleanedMarkdown))
          } else {
            mdFile = matter(content)
          }
          // Extract title from frontmatter or use the first heading
          const title = extractTitle(mdFile)?.trim() || 'Untitled'

          const filePath =
            path.basename(file) === 'index.md' &&
            path.dirname(file) !== settings.workDir
              ? `${path.dirname(file)}.md`
              : file

          return { path: filePath, title, file: mdFile }
        })
      )

      if (settings.generateLLMFriendlyDocsForEachPage) {
        await Promise.all(
          preparedFiles.map(async (file) => {
            const relativePath = path.relative(settings.workDir, file.path)
            try {
              const mdFile = file.file
              const targetPath = path.resolve(outDir, relativePath)

              // Ensure target directory exists (async version)
              await fs.mkdir(path.dirname(targetPath), {
                recursive: true
              })

              // Copy file to output directory (async version)
              await fs.writeFile(
                targetPath,
                matter.stringify(
                  mdFile.content,
                  generateMetadata(mdFile, {
                    domain: settings.domain,
                    filePath: relativePath
                  })
                )
              )

              log.success(`Processed ${pc.cyan(relativePath)}`)
            } catch (error) {
              log.error(
                // @ts-ignore
                `Failed to process ${pc.cyan(relativePath)}: ${error.message}`
              )
            }
          })
        )
      }

      // Sort files by title for better organization
      preparedFiles.sort((a, b) => a.title.localeCompare(b.title))

      const tasks: Promise<void>[] = []

      // Generate llms.txt - table of contents with links
      if (settings.generateLLMsTxt) {
        const llmsTxtPath = path.resolve(outDir, 'llms.txt')
        const templateVariables: CustomTemplateVariables = {
          title: settings.title,
          description: settings.description,
          details: settings.details,
          toc: settings.toc,
          ...settings.customTemplateVariables
        }

        tasks.push(
          (async () => {
            log.info(`Generating ${pc.cyan('llms.txt')}...`)

            const llmsTxt = await generateLLMsTxt(preparedFiles, {
              indexMd: path.resolve(settings.workDir as string, 'index.md'),
              srcDir: settings.workDir as string,
              LLMsTxtTemplate:
                settings.customLLMsTxtTemplate || defaultLLMsTxtTemplate,
              templateVariables,
              vitepressConfig: config?.vitepress?.userConfig,
              domain: settings.domain,
              sidebar: settings.sidebar,
              linksExtension: !settings.generateLLMFriendlyDocsForEachPage
                ? '.html'
                : undefined,
              cleanUrls: config.cleanUrls
            })

            await fs.writeFile(llmsTxtPath, llmsTxt, 'utf-8')

            log.success(
              expandTemplate(
                'Generated {file} (~{tokens} tokens, {size}) with {fileCount} documentation links',
                {
                  file: pc.cyan('llms.txt'),
                  tokens: pc.bold(millify(approximateTokenSize(llmsTxt))),
                  size: pc.bold(getHumanReadableSizeOf(llmsTxt)),
                  fileCount: pc.bold(fileCount.toString())
                }
              )
            )
          })()
        )
      }

      // Generate llms-full.txt - all content in one file
      if (settings.generateLLMsFullTxt) {
        const llmsFullTxtPath = path.resolve(outDir, 'llms-full.txt')

        tasks.push(
          (async () => {
            log.info(
              `Generating full documentation bundle (${pc.cyan('llms-full.txt')})...`
            )

            const llmsFullTxt = generateLLMsFullTxt(preparedFiles, {
              srcDir: settings.workDir as string,
              domain: settings.domain,
              linksExtension: !settings.generateLLMFriendlyDocsForEachPage
                ? '.html'
                : undefined,
              cleanUrls: config.cleanUrls
            })

            // Write content to llms-full.txt
            await fs.writeFile(llmsFullTxtPath, llmsFullTxt, 'utf-8')
            log.success(
              expandTemplate(
                'Generated {file} (~{tokens} tokens, {size}) with {fileCount} markdown files',
                {
                  file: pc.cyan('llms-full.txt'),
                  tokens: pc.bold(millify(approximateTokenSize(llmsFullTxt))),
                  size: pc.bold(getHumanReadableSizeOf(llmsFullTxt)),
                  fileCount: pc.bold(fileCount.toString())
                }
              )
            )
          })()
        )
      }

      if (tasks.length) {
        await Promise.all(tasks)
      }
    }
  }
}
