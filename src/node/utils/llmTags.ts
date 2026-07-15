import type { LlmsOptions } from '../build/generateLlmsTxt'
import type { UserConfig } from '../siteConfig'

export function isLlmsEnabled(
  llms: UserConfig['llms']
): llms is true | LlmsOptions {
  return !!llms && (llms === true || llms.enabled !== false)
}

/**
 * Prepares markdown for the HTML build: `<llm-only>` blocks are dropped
 * with their content, `<llm-exclude>` tags are removed keeping the content.
 */
export function stripLlmTags(src: string): string {
  return processLlmTags(src, 'exclude')
}

/**
 * Prepares markdown for LLM output: `<llm-only>` tags are removed keeping
 * the content, `<llm-exclude>` blocks are dropped with their content.
 */
export function resolveLlmTags(src: string): string {
  return processLlmTags(src, 'only')
}

// up to 3 leading spaces like CommonMark fences; anything more is an
// indented code block
const tagRE = /^ {0,3}<(\/?)llm-(only|exclude)>\s*$/
const fenceRE = /^ {0,3}(`{3,}|~{3,})/

/**
 * Removes `<llm-only>` / `<llm-exclude>` blocks, keeping the content of
 * `keep` blocks and dropping the other's. Tags must be alone on their line
 * and outside fenced code blocks; anything else is left untouched so the
 * tags themselves can be documented.
 */
function processLlmTags(src: string, keep: 'only' | 'exclude'): string {
  const lines = src.split('\n')
  const out: string[] = []
  // tag line + content buffered until the closing tag; flushed verbatim if
  // the block is never closed
  let block: { tag: string; lines: string[] } | undefined
  let fence: string | undefined

  for (const line of lines) {
    const fenceMatch = line.match(fenceRE)
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1]
      else if (
        fenceMatch[1][0] === fence[0] &&
        fenceMatch[1].length >= fence.length
      )
        fence = undefined
    }

    const tagMatch = fenceMatch || fence ? null : line.match(tagRE)
    if (tagMatch) {
      const [, closing, tag] = tagMatch
      if (!block && !closing) {
        block = { tag, lines: [line] }
        continue
      }
      if (block && closing && tag === block.tag) {
        if (tag === keep) out.push(...block.lines.slice(1))
        block = undefined
        continue
      }
    }

    if (block) block.lines.push(line)
    else out.push(line)
  }

  // unclosed block: restore it verbatim
  if (block) out.push(...block.lines)

  return out.join('\n')
}
