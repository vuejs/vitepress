import { container } from '@mdit/plugin-container'
import type { MarkdownItAsync } from 'markdown-it-async'
import type { RenderRule } from 'markdown-it/lib/renderer.mjs'
import type Token from 'markdown-it/lib/token.mjs'
import type {
  ContainerOptions,
  MarkdownEnv,
  MarkdownLocaleOptions
} from '../../shared'
import { extractTitle } from './preWrapper'

export type { ContainerOptions } from '../../shared'

export interface ContainerPluginOptions {
  /**
   * Whether fence-line `{...}` attributes are parsed. Mirrors the state of
   * the `markdown.attrs` option.
   */
  attrs?: boolean
  /**
   * Per-locale overrides for container titles, keyed by locale index.
   */
  locales?: Record<string, MarkdownLocaleOptions | undefined>
}

export const containerPlugin = (
  md: MarkdownItAsync,
  options?: ContainerOptions,
  { attrs = true, locales }: ContainerPluginOptions = {}
) => {
  md
    // explicitly escape Vue syntax
    .use(container, {
      name: 'v-pre',
      openRender: () => `<div v-pre>\n`,
      closeRender: () => `</div>\n`
    })
    .use(container, {
      name: 'raw',
      openRender: () => `<div class="vp-raw">\n`,
      closeRender: () => `</div>\n`
    })
    .use(container, {
      name: 'code-group',
      openRender: createCodeGroupOpenRender(md),
      closeRender: () => `</div></div>\n`
    })

  const titles = resolveTitlesByLocale(options, locales)

  for (const name of Object.keys(titles.base)) {
    md.use(container, {
      name,
      openRender: createOpenRender(md, name, titles, attrs),
      closeRender: () => (name === 'details' ? `</details>\n` : `</div>\n`)
    })
  }
}

interface LocaleTitles {
  base: Record<string, string>
  byLocale: Record<string, Record<string, string>>
}

function titlesFor(
  titles: LocaleTitles,
  localeIndex: string | undefined
): Record<string, string> {
  return (localeIndex && titles.byLocale[localeIndex]) || titles.base
}

const containerLabels = [
  ['tip', 'tipLabel', 'TIP'],
  ['info', 'infoLabel', 'INFO'],
  ['warning', 'warningLabel', 'WARNING'],
  ['danger', 'dangerLabel', 'DANGER'],
  ['details', 'detailsLabel', 'Details'],
  ['note', 'noteLabel', 'NOTE'],
  ['important', 'importantLabel', 'IMPORTANT'],
  ['caution', 'cautionLabel', 'CAUTION']
] as const

function resolveTitlesByLocale(
  options?: ContainerOptions,
  locales?: Record<string, MarkdownLocaleOptions | undefined>
): LocaleTitles {
  const base: Record<string, string> = {}
  for (const [name, key, defaultTitle] of containerLabels) {
    base[name] = options?.[key] || defaultTitle
  }
  for (const [name, title] of Object.entries(options?.customContainers ?? {})) {
    if (
      !/^[a-z0-9_-]+$/.test(name) ||
      ['v-pre', 'raw', 'code-group'].includes(name)
    )
      throw new Error(
        `Invalid custom container name: "${name}". Names must be lowercase ` +
          `([a-z0-9_-]) and cannot be "v-pre", "raw", or "code-group".`
      )
    base[name] = title
  }

  const byLocale: Record<string, Record<string, string>> = {}
  for (const [localeIndex, localeOptions] of Object.entries(locales ?? {})) {
    const overrides = localeOptions?.container
    if (!overrides) continue
    const titles = { ...base }
    for (const [name, key] of containerLabels) {
      if (overrides[key]) titles[name] = overrides[key]
    }
    for (const [name, title] of Object.entries(
      overrides.customContainers ?? {}
    )) {
      if (!Object.hasOwn(base, name))
        throw new Error(
          `Custom container "${name}" in locale "${localeIndex}" is not ` +
            `registered in the root markdown config. Locales can only ` +
            `override titles of existing containers.`
        )
      titles[name] = title
    }
    byLocale[localeIndex] = titles
  }

  return { base, byLocale }
}

function createOpenRender(
  md: MarkdownItAsync,
  name: string,
  titles: LocaleTitles,
  attrs: boolean
): RenderRule {
  return (tokens, idx, _options, env: MarkdownEnv & { references?: any }) => {
    const token = tokens[idx]
    let info = token.info.trim().slice(name.length).trim()
    if (attrs) info = applyFenceAttrs(token, info)
    // details always needs its summary, so no-title is ignored there
    const noTitle = attrPop(token, 'no-title') === '' && name !== 'details'
    token.attrJoin('class', `${name} custom-block`)
    const renderedAttrs = md.renderer.renderAttrs(token).trim()
    if (noTitle) return `<div ${renderedAttrs}>\n`
    const title = md.renderInline(
      info || titlesFor(titles, env.localeIndex)[name],
      { references: env.references }
    )
    if (name === 'details')
      return `<details ${renderedAttrs}><summary>${title}</summary>\n`
    const titleClass =
      'custom-block-title' + (info ? '' : ' custom-block-title-default')
    return `<div ${renderedAttrs}><p class="${titleClass}">${title}</p>\n`
  }
}

function attrPop(token: Token, name: string): string | null {
  const idx = token.attrIndex(name)
  if (idx < 0) return null
  return token.attrs!.splice(idx, 1)[0][1]
}

// `::: tip Title {#id .class key="value" bare}` - the attrs plugin only
// handles fence lines through its `fence` rule, which is disabled to keep
// code block meta intact, so its trailing-braces syntax is parsed here
const fenceAttrsRE = /(?:^|\s)\{\s*([^{}]+?)\s*\}$/
const attrRE = /([^\s=]+)(?:=("[^"]*"|\S*))?/g

function applyFenceAttrs(token: Token, info: string): string {
  const match = fenceAttrsRE.exec(info)
  if (!match) return info
  for (const [, name, value = ''] of match[1].matchAll(attrRE)) {
    if (name.startsWith('.')) {
      if (name.length > 1) token.attrJoin('class', name.slice(1))
    } else if (name.startsWith('#')) {
      if (name.length > 1) token.attrPush(['id', name.slice(1)])
    } else {
      token.attrPush([name, value.replace(/^"(.*)"$/, '$1')])
    }
  }
  return info.slice(0, match.index)
}

function createCodeGroupOpenRender(md: MarkdownItAsync): RenderRule {
  return (tokens, idx) => {
    let tabs = ''
    let checked = 'checked'

    for (
      let i = idx + 1;
      !(
        tokens[i].nesting === -1 &&
        tokens[i].type === 'container_code-group_close'
      );
      ++i
    ) {
      const isHtml = tokens[i].type === 'html_block'

      if ((tokens[i].type === 'fence' && tokens[i].tag === 'code') || isHtml) {
        const title = extractTitle(
          isHtml ? tokens[i].content : tokens[i].info,
          isHtml
        )

        if (title) {
          tabs += `<input type="radio" name="group-${idx}" id="tab-${i}" ${checked}><label data-title="${md.utils.escapeHtml(title)}" for="tab-${i}">${title}</label>`

          if (checked && !isHtml) tokens[i].info += ' active'
          checked = ''
        }
      }
    }

    return `<div class="vp-code-group"><div class="tabs">${tabs}</div><div class="blocks">\n`
  }
}

const alertMarkerRE = /^\[!([\w-]+)\]([^\n\r]*)/

export const gitHubAlertsPlugin = (
  md: MarkdownItAsync,
  options?: ContainerOptions,
  { locales }: Pick<ContainerPluginOptions, 'locales'> = {}
) => {
  const titles = resolveTitlesByLocale(options, locales)

  md.core.ruler.after('block', 'github-alerts', (state) => {
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'blockquote_open') {
        const startIndex = i
        const open = tokens[startIndex]
        let endIndex = i + 1
        while (
          endIndex < tokens.length &&
          (tokens[endIndex].type !== 'blockquote_close' ||
            tokens[endIndex].level !== open.level)
        )
          endIndex++
        if (endIndex === tokens.length) continue
        const close = tokens[endIndex]
        const firstContent = tokens
          .slice(startIndex, endIndex + 1)
          .find((token) => token.type === 'inline')
        if (!firstContent) continue
        const match = firstContent.content.match(alertMarkerRE)
        if (!match) continue
        const type = match[1].toLowerCase()
        // details makes no sense as a blockquote-style alert
        if (type === 'details' || !Object.hasOwn(titles.base, type)) continue
        const title =
          match[2].trim() ||
          titlesFor(titles, (state.env as MarkdownEnv)?.localeIndex)[type]
        firstContent.content = firstContent.content
          .slice(match[0].length)
          .trimStart()
        open.type = 'github_alert_open'
        open.tag = 'div'
        open.meta = { title, type }
        close.type = 'github_alert_close'
        close.tag = 'div'
      }
    }
  })
  md.renderer.rules.github_alert_open = function (tokens, idx) {
    const { title, type } = tokens[idx].meta
    return `<div class="${type} custom-block github-alert"><p class="custom-block-title">${title}</p>\n`
  }
}
