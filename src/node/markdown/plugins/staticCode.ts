// A highlighted code block is thousands of elements that never change. Vue's
// compiler parses every one of them and writes them back as one static string,
// once for the client build and once for the server build. This hands Vue that
// string directly: the children of the `<pre v-pre>` that the highlighter
// returns become a constant `v-html`, which the compiler stringifies into the
// same static node without parsing them.
//
// The block is rewritten where it is made, in the highlighter's result for one
// fence, so nothing has to find code blocks in the html of a page. Whether a
// fence may be rewritten is read from the tokens, before anything is rendered.

import type { MarkdownItAsync } from 'markdown-it-async'
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs'
import type Token from 'markdown-it/lib/token.mjs'

import type { MarkdownEnv } from '../../shared'
import { STATIC_END, STATIC_START } from '../../utils/leanChunk'
import { forEachOutsideVPre } from './eagerFrontmatterInterpolation'

type Highlight = (
  str: string,
  lang: string,
  attrs: string
) => string | Promise<string>

// The tokens of markdown-it that may enclose a fence. Their rules render no
// `v-pre`. The tokens of the containers and alerts of VitePress are added to
// them. A fence under any other token, such as a container that a plugin
// adds, is left alone.
const plainParents = [
  'blockquote_open',
  'bullet_list_open',
  'ordered_list_open',
  'list_item_open',
  'footnote_open',
  'footnote_block_open'
]

// Raw html that opens an element whose content is text. What follows it on the
// page may be that text.
const rawTextRE =
  /<(?:textarea|title|xmp|plaintext|noembed|noframes|noscript|iframe)[\s>]/i

const attributeName = /[^\s"'=<>`/]+/.source
const openTagRE = new RegExp(`^<pre((?:\\s+${attributeName}(?:="[^"]*")?)*)>`)
const attributeRE = new RegExp(`\\s+(${attributeName})(?:="[^"]*")?`, 'g')
// Attributes that mean the same with and without `v-pre`.
const plainAttributeRE =
  /^(?:class|style|tabindex|dir|lang|id|title|data-[\w-]+|aria-[\w-]+)$/

// The first thing in the content that Vue's parser and the browser's may read
// differently, or that the lean chunk would cut at.
const unsafeRE = new RegExp(
  [
    // an element that is not part of a highlighted block
    `<(?!/?(?:code|span|wbr)(?:\\s+${attributeName}(?:="[^"<>]*")?)*\\s*>)`,
    // a character reference other than `&`, `<`, `>`, `"` and `'` by name or
    // by number, which not every parser decodes the same way
    /&(?!(?:#[xX](?:26|3[CcEe]|2[27])|#(?:3[489]|6[02])|amp|lt|gt|quot|apos);)/
      .source,
    // a character that a parser normalizes
    /[\r\0]/.source,
    STATIC_START,
    STATIC_END
  ].join('|')
)

const escapes: Record<string, string> = {
  '\\': '\\\\',
  '`': '\\`',
  '${': '\\${',
  '&': '\\x26',
  "'": '\\x27'
}

/**
 * A template literal that evaluates to `text`, for an attribute in single
 * quotes. What means something to the attribute, `&` and `'`, is written as
 * an escape of the literal, so the attribute value needs no decoding.
 */
export function toStaticExpression(text: string): string {
  return '`' + text.replace(/[\\`&']|\$\{/g, (char) => escapes[char]) + '`'
}

/**
 * Moves the children of a static code block into a constant `v-html`, marked
 * for the lean chunk, which leaves it out. The block is what a highlighter
 * returned for one fence. One that Vue and the browser are not known to read
 * the same way is returned as it is.
 */
export function hoistStaticCode(html: string): string {
  const open = openTagRE.exec(html)
  if (!open || !html.endsWith('</pre>')) return html

  let attrs = ''
  let vPre = false
  for (const [attribute, name] of open[1].matchAll(attributeRE)) {
    if (name === 'v-pre') vPre = true
    else if (plainAttributeRE.test(name)) attrs += attribute
    else return html
  }
  if (!vPre) return html

  const inner = html.slice(open[0].length, -'</pre>'.length)
  // The HTML parser drops a newline that follows `<pre>`. `innerHTML` keeps it.
  if (!inner || inner[0] === '\n' || unsafeRE.test(inner)) return html

  const expression = toStaticExpression(STATIC_START + inner + STATIC_END)
  return `<pre${attrs} v-html='${expression}'></pre>`
}

const hasRawTextElement = (tokens: Token[]): boolean =>
  tokens.some((token) =>
    token.type === 'html_block'
      ? rawTextRE.test(token.content)
      : token.children?.some(
          (child) =>
            child.type === 'html_inline' && rawTextRE.test(child.content)
        )
  )

const count = (text: string, part: string) => text.split(part).length - 1

/** Takes the markers out of the code blocks of a template. */
export function unmarkStaticCode(template: string): string {
  return template
    .replaceAll(`v-html='\`${STATIC_START}`, "v-html='`")
    .replaceAll(`${STATIC_END}\`'></pre>`, "`'></pre>")
}

/** What the fence rule and the highlighter tell each other about one fence. */
interface Fence {
  /** The highlighted block, when the highlighter returned it at once. */
  html?: string
  /** The text that the fence rule had from the highlighter's side. */
  text?: string
  /** Whether a block that is still being highlighted is to be rewritten. */
  hoist: boolean
}

/**
 * Returns the highlighter to give markdown-it and the plugin to use on it.
 * Together they rewrite the static code blocks of a page whose environment
 * asks for it with `staticCode`.
 */
export function staticCode(
  highlight: Highlight
): [
  highlight: Highlight,
  plugin: (md: MarkdownItAsync, parents: string[]) => void
] {
  // The fence that the fence rule is rendering, if it is one to rewrite. The
  // rule calls the highlighter before it returns, so this reaches that call.
  let pending: Fence | undefined
  // The parse that a page's environment asked for. Markdown that a plugin
  // parses or renders on its own with that environment has parents that its
  // tokens do not show.
  const pages = new WeakMap<object, StateCore>()

  return [
    (str, lang, attrs) => {
      const fence = pending
      pending = undefined
      const html = highlight(str, lang, attrs)
      if (!fence || !html) return html
      if (typeof html === 'string') {
        fence.text = fence.html = html
        return html
      }
      // markdown-it-async renders the code itself in place of the block
      fence.text = str
      return html.then((block) =>
        fence.hoist && typeof block === 'string'
          ? hoistStaticCode(block)
          : block
      )
    },
    (md, parents) => {
      const plain = new Set([...plainParents, ...parents])

      md.core.ruler.before('normalize', 'vp_static_code_page', (state) => {
        const env: MarkdownEnv = state.env
        if (env.staticCode && !pages.has(env)) pages.set(env, state)
      })

      // Marks the fences of a page that are known to be in no `v-pre` scope.
      md.core.ruler.push('vp_static_code', (state: StateCore) => {
        const env: MarkdownEnv = state.env
        if (pages.get(env) !== state) return
        pages.delete(env)
        delete env.staticCode
        if (hasRawTextElement(state.tokens)) return

        forEachOutsideVPre(state.tokens, (token) => {
          if (token.nesting === 1) return plain.has(token.type)
          if (token.type === 'fence') {
            token.meta = { ...token.meta, staticCode: true }
          }
        })
      })

      const rule = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, idx, ...args) => {
        const fence: Fence | undefined = tokens[idx].meta?.staticCode
          ? { hoist: true }
          : undefined
        pending = fence
        let out: string
        try {
          out = rule(tokens, idx, ...args)
        } finally {
          pending = undefined
        }
        if (fence?.text === undefined) return out
        // A rule of a plugin around this one may have put the block into a
        // `v-pre` element of its own, or changed the block.
        if (count(out, 'v-pre') > count(fence.text, 'v-pre')) {
          fence.hoist = false
          return out
        }
        const { html } = fence
        return html ? out.replace(html, () => hoistStaticCode(html)) : out
      }
    }
  ]
}
