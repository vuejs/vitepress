import type { LlmsOptions } from '../build/generateLlmsTxt'
import type { UserConfig } from '../siteConfig'

const llmOnlyRE = /<llm-only>([^]*?)<\/llm-only>/g
const llmExcludeRE = /<llm-exclude>([^]*?)<\/llm-exclude>/g

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
  return src.replace(llmOnlyRE, '').replace(llmExcludeRE, '$1')
}

/**
 * Prepares markdown for LLM output: `<llm-only>` tags are removed keeping
 * the content, `<llm-exclude>` blocks are dropped with their content.
 */
export function resolveLlmTags(src: string): string {
  return src.replace(llmOnlyRE, '$1').replace(llmExcludeRE, '')
}
