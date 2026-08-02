import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight
} from '@shikijs/transformers'
import { LRUCache } from 'lru-cache'
import { customAlphabet } from 'nanoid'
import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import c from 'picocolors'
import type { BundledLanguage, ShikiTransformer } from 'shiki'
import { createHighlighter, guessEmbeddedLanguages, isSpecialLang } from 'shiki'
import { version as shikiVersion } from 'shiki/package.json'
import type { Logger } from 'vite'
import { version as vitepressVersion } from '../../../../package.json'
import { isShell } from '../../shared'
import type { MarkdownOptions, ThemeOptions } from '../markdown'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10)
const HIGHLIGHT_CACHE_SCHEMA_VERSION = 2
const HIGHLIGHT_MEMORY_CACHE_SIZE = 16 * 1024 * 1024

/**
 * Prevents the leading '$' symbol etc from being selectable/copyable. Also
 * normalizes its syntax so there's no leading spaces, and only a single
 * trailing space.
 *
 * NOTE: Any changes to this function may also need to update
 * `src/client/app/composables/copyCode.ts`
 */
function transformerDisableShellSymbolSelect(): ShikiTransformer {
  return {
    name: 'vitepress:disable-shell-symbol-select',
    tokens(tokensByLine) {
      if (!isShell(this.options.lang)) return

      for (const tokens of tokensByLine) {
        if (tokens.length < 2) continue

        // The first token should only be a symbol token
        const firstTokenText = tokens[0].content.trim()
        if (firstTokenText !== '$' && firstTokenText !== '>') continue

        // The second token must have a leading space (separates the symbol)
        if (tokens[1].content[0] !== ' ') continue

        tokens[0].content = firstTokenText + ' '
        tokens[0].htmlStyle ??= {}
        tokens[0].htmlStyle['user-select'] = 'none'
        tokens[0].htmlStyle['-webkit-user-select'] = 'none'
        tokens[1].content = tokens[1].content.slice(1)
      }
    }
  }
}

export async function highlight(
  theme: ThemeOptions,
  options: MarkdownOptions,
  logger: Pick<Logger, 'warn'> = console,
  cacheDir?: string
): Promise<
  [(str: string, lang: string, attrs: string) => Promise<string>, () => void]
> {
  const {
    defaultHighlightLang: defaultLang = 'txt',
    codeTransformers: userTransformers = []
  } = options

  const langAlias = Object.fromEntries(
    Object.entries(options.languageAlias || {}) //
      .map(([k, v]) => [k.toLowerCase(), v])
  )

  let runtimePromise:
    | Promise<{
        highlighter: Awaited<ReturnType<typeof createHighlighter>>
        transformers: ShikiTransformer[]
      }>
    | undefined
  const getRuntime = () =>
    (runtimePromise ??= (async () => {
      const highlighter = await createHighlighter({
        themes:
          typeof theme === 'object' && 'light' in theme && 'dark' in theme
            ? [theme.light, theme.dark]
            : [theme],
        langs: [...(options.languages || []), ...Object.values(langAlias)],
        langAlias
      })

      await options?.shikiSetup?.(highlighter)

      const transformers: ShikiTransformer[] = [
        transformerMetaHighlight(),
        transformerNotationDiff(),
        transformerNotationFocus({
          classActiveLine: 'has-focus',
          classActivePre: 'has-focused-lines'
        }),
        transformerNotationHighlight(),
        transformerNotationErrorLevel(),
        transformerDisableShellSymbolSelect(),
        {
          name: 'vitepress:add-dir',
          pre(node) {
            node.properties.dir = 'ltr'
          }
        }
      ]

      return { highlighter, transformers }
    })())

  const colorReplacements = {
    'github-light': {
      '#959da5': '#6c676f',
      '#28a745': '#0e790b',
      '#b08800': '#846312',
      '#e36209': '#c13617',
      '#3192aa': '#05728b',
      '#d73a49': '#c62739',
      '#22863a': '#11782a',
      '#6a737d': '#62687b',
      '#1b7c83': '#06747a',
      '#0366d6': '#0663d0',
      '#cb2431': '#c82430'
    },
    'github-dark': {
      '#586069': '#5b93a3',
      '#6a737d': '#818e99',
      '#ea4a5a': '#ef5564',
      '#2188ff': '#268bf9'
    },
    ...options.colorReplacements
  }

  const cacheNamespace = hash(
    stableSerialize({
      schemaVersion: HIGHLIGHT_CACHE_SCHEMA_VERSION,
      vitepressVersion,
      shikiVersion,
      theme,
      languages: options.languages,
      langAlias,
      defaultLang,
      transformerFactories: [
        transformerMetaHighlight,
        transformerNotationDiff,
        transformerNotationFocus,
        transformerNotationHighlight,
        transformerNotationErrorLevel,
        transformerDisableShellSymbolSelect,
        'vitepress:add-dir',
        'vitepress:v-pre',
        'vitepress:empty-line'
      ],
      userTransformers,
      colorReplacements,
      shikiSetup: options.shikiSetup,
      shikiCacheKey: options.shikiCacheKey
    })
  )
  const cacheRoot = cacheDir
    ? path.join(cacheDir, 'vitepress-shiki', cacheNamespace)
    : undefined
  const memoryCache = new LRUCache<string, string>({
    maxSize: HIGHLIGHT_MEMORY_CACHE_SIZE,
    sizeCalculation: (value) => Buffer.byteLength(value)
  })
  const pending = new Map<string, Promise<string>>()

  // keep in sync with ./preWrapper.ts#extractLang
  const langRE = /^[a-zA-Z0-9-_]+/
  const vueRE = /-vue$/

  return [
    async (str, lang, attrs) => {
      const match = langRE.exec(lang)
      if (match) {
        const orig = lang
        lang = match[0].toLowerCase()
        attrs = orig.slice(lang.length).replace(/(?<!=)\{/g, ' {') + ' ' + attrs
        attrs = attrs.trim().replace(/\s+/g, ' ')
      }

      lang ||= defaultLang

      const vPre = !vueRE.test(lang)
      if (!vPre) lang = lang.slice(0, -4)

      str = str.trimEnd()
      const cacheKey = hashParts([
        cacheNamespace,
        str,
        lang,
        attrs,
        vPre ? 'v-pre' : 'vue'
      ])
      const cached = memoryCache.get(cacheKey)
      if (cached != null) return cached
      const existing = pending.get(cacheKey)
      if (existing) return existing

      const operation = (async () => {
        if (cacheRoot) {
          const cached = await readCachedHighlight(cacheRoot, cacheKey)
          if (cached != null) return cached
        }

        const { highlighter, transformers } = await getRuntime()

        try {
          // https://github.com/shikijs/shiki/issues/952
          if (
            !isSpecialLang(lang) &&
            !highlighter.getLoadedLanguages().includes(lang)
          ) {
            await highlighter.loadLanguage(lang as any)
          }
        } catch {
          logger.warn(
            c.yellow(
              `\nThe language '${lang}' is not loaded, falling back to '${defaultLang}' for syntax highlighting.`
            )
          )
          lang = defaultLang
        }

        const mustaches = new Map<string, string>()

        const removeMustache = (s: string) => {
          if (vPre) return s
          return s.replace(/\{\{.*?\}\}/g, (match) => {
            let marker = mustaches.get(match)
            if (!marker) {
              marker = nanoid()
              mustaches.set(match, marker)
            }
            return marker
          })
        }

        const restoreMustache = (s: string) => {
          mustaches.forEach((marker, match) => {
            s = s.replaceAll(marker, match)
          })
          return s
        }

        str = removeMustache(str)

        const embeddedLang = guessEmbeddedLanguages(str, lang, highlighter)
        await highlighter.loadLanguage(...(embeddedLang as BundledLanguage[]))

        const highlighted = highlighter.codeToHtml(str, {
          lang,
          transformers: [
            ...transformers,
            {
              name: 'vitepress:v-pre',
              pre(node) {
                if (vPre) node.properties['v-pre'] = ''
              }
            },
            {
              name: 'vitepress:empty-line',
              code(hast) {
                hast.children.forEach((span) => {
                  if (
                    span.type === 'element' &&
                    span.tagName === 'span' &&
                    Array.isArray(span.properties.class) &&
                    span.properties.class.includes('line') &&
                    span.children.length === 0
                  ) {
                    span.children.push({
                      type: 'element',
                      tagName: 'wbr',
                      properties: {},
                      children: []
                    })
                  }
                })
              }
            },
            ...userTransformers
          ],
          meta: { __raw: attrs },
          ...(typeof theme === 'object' && 'light' in theme && 'dark' in theme
            ? { themes: theme, defaultColor: false }
            : { theme }),
          colorReplacements
        })

        const result = restoreMustache(highlighted)
        if (cacheRoot) {
          await writeCachedHighlight(cacheRoot, cacheKey, result)
        }
        return result
      })()

      pending.set(cacheKey, operation)
      try {
        const result = await operation
        if (Buffer.byteLength(result) <= HIGHLIGHT_MEMORY_CACHE_SIZE) {
          memoryCache.set(cacheKey, result)
        }
        return result
      } finally {
        pending.delete(cacheKey)
      }
    },
    () => {
      runtimePromise
        ?.then(({ highlighter }) => highlighter.dispose())
        .catch(() => {})
    }
  ]
}

async function readCachedHighlight(
  root: string,
  cacheKey: string
): Promise<string | undefined> {
  try {
    return await readFile(getCacheFile(root, cacheKey), 'utf8')
  } catch {
    return
  }
}

async function writeCachedHighlight(
  root: string,
  cacheKey: string,
  html: string
): Promise<void> {
  const file = getCacheFile(root, cacheKey)
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
  try {
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(temporary, html, { mode: 0o600 })
    await rename(temporary, file)
  } catch {
    // Highlight caching is an optimization; read-only or partially cleared
    // cache directories must not make the documentation build fail.
  } finally {
    await unlink(temporary).catch(() => {})
  }
}

function getCacheFile(root: string, cacheKey: string): string {
  return path.join(root, cacheKey.slice(0, 2), `${cacheKey}.html`)
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function hashParts(parts: string[]): string {
  const digest = createHash('sha256')
  for (const part of parts) {
    digest.update(`${Buffer.byteLength(part)}:`)
    digest.update(part)
  }
  return digest.digest('hex')
}

function stableSerialize(value: unknown, seen = new Set<object>()): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  const valueType = typeof value
  if (valueType === 'string') return JSON.stringify(value)
  if (valueType === 'number' || valueType === 'boolean') return String(value)
  if (valueType === 'bigint') return `${value}n`
  if (valueType === 'symbol') return String(value)
  if (valueType === 'function') return `function:${String(value)}`

  const object = value as object
  if (seen.has(object)) return '[Circular]'
  seen.add(object)
  try {
    if (object instanceof RegExp) return `regexp:${String(object)}`
    if (object instanceof Date) return `date:${object.toISOString()}`
    if (Array.isArray(object)) {
      return `[${object.map((item) => stableSerialize(item, seen)).join(',')}]`
    }
    if (object instanceof Map) {
      const entries = [...object].map(
        ([key, item]) =>
          `${stableSerialize(key, seen)}:${stableSerialize(item, seen)}`
      )
      return `map:{${entries.sort().join(',')}}`
    }
    if (object instanceof Set) {
      return `set:[${[...object]
        .map((item) => stableSerialize(item, seen))
        .sort()
        .join(',')}]`
    }

    const record = object as Record<string, unknown>
    const constructorName = object.constructor?.name || 'Object'
    return `${constructorName}:{${Object.keys(record)
      .sort()
      .map(
        (key) => `${JSON.stringify(key)}:${stableSerialize(record[key], seen)}`
      )
      .join(',')}}`
  } finally {
    seen.delete(object)
  }
}
