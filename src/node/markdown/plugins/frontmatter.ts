import type { FrontmatterPluginOptions } from '@mdit-vue/plugin-frontmatter'
import matter from 'gray-matter'
import type { MarkdownItAsync } from 'markdown-it-async'

/**
 * Vendored from `@mdit-vue/plugin-frontmatter` (extracts `env.frontmatter`,
 * `env.content` and `env.excerpt` before parsing), with one behavioral
 * change: the stripped frontmatter block is replaced with blank lines, so
 * every `token.map` stays in the coordinates of the full source instead of
 * shifting up by the frontmatter height. Blank lines produce no tokens, so
 * the rendered output is unchanged. Offering this upstream as a
 * `preserveLines` option is tracked as a follow-up.
 */
export function frontmatterPlugin(
  md: MarkdownItAsync,
  { grayMatterOptions, renderExcerpt = true }: FrontmatterPluginOptions = {}
): void {
  const parse = md.parse.bind(md)
  md.parse = (src, env: Record<string, unknown> = {}) => {
    const { data, content, excerpt = '' } = matter(src, grayMatterOptions)

    env.content = content
    env.frontmatter = { ...(env.frontmatter as object), ...data }
    // the excerpt's token maps are excerpt-local — keep the page's line map
    // and dev source attributes out of its render
    env.excerpt =
      renderExcerpt && excerpt
        ? md.render(excerpt, {
            ...env,
            lineMap: undefined,
            emitSourceLoc: false
          })
        : excerpt

    // gray-matter only ever removes lines from the top of the file, so the
    // difference in line-break counts is exactly the removed line count
    const removed =
      src.length === content.length
        ? 0
        : countLineBreaks(src) - countLineBreaks(content)
    return parse(removed > 0 ? '\n'.repeat(removed) + content : content, env)
  }
}

function countLineBreaks(str: string): number {
  return str.match(/\r\n|[\r\n]/g)?.length ?? 0
}
