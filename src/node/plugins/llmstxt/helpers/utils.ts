import path from 'node:path'
import byteSize from 'byte-size'
import type { GrayMatterFile, Input } from 'gray-matter'
// @ts-expect-error
import markdownTitle from 'markdown-title'
import type { LinksExtension, LlmstxtSettings, VitePressConfig } from '../types'

/**
 * Splits a file path into its directory and file components.
 *
 * @param filepath - The path to the file.
 * @returns An object containing the directory and file name.
 */
export const splitDirAndFile = (filepath: string) => ({
	dir: path.dirname(filepath),
	file: path.basename(filepath),
})

/**
 * Strips the file extension from a given file path.
 *
 * @param filepath - The path to the file.
 * @returns The filename without the extension.
 */
export const stripExt = (filepath: string) => {
	const { dir, file } = splitDirAndFile(filepath)

	return path.join(dir, path.basename(file, path.extname(file)))
}

/**
 * Strips the file extension from a given file path using POSIX format.
 *
 * @param filepath - The path to the file.
 * @returns The filename without the extension in POSIX format.
 */
export const stripExtPosix = (filepath: string) => {
	const { dir, file } = splitDirAndFile(filepath)

	return path.posix.join(dir, path.basename(file, path.extname(file)))
}

/**
 * Extracts the title from a markdown file's frontmatter or first heading.
 *
 * @param file - The markdown file to extract the title from.
 * @returns The extracted title, or `undefined` if no title is found.
 */
export function extractTitle(file: GrayMatterFile<Input>): string {
	const titleFromFrontmatter = file.data?.title || file.data?.titleTemplate
	let titleFromMarkdown: string | undefined

	if (!titleFromFrontmatter) {
		titleFromMarkdown = markdownTitle(file.content)
	}
	return titleFromFrontmatter || titleFromMarkdown
}

/**
 * Creates a regular expression to match a specific template variable in the format `{key}`.
 *
 * @param key - The name of the template variable to match.
 * @returns A case-insensitive regular expression that detects `{key}` occurrences in a string.
 *
 * @example
 * ```ts
 * const regex = templateVariable('name');
 * console.log(regex.test('Hello {name}')); // true
 * ```
 */
const templateVariable = (key: string) =>
	new RegExp(`(\\n\\s*\\n)?\\{${key}\\}`, 'gi')

/**
 * Replaces occurrences of a template variable `{variable}` in a given content string with a provided value.
 * If the value is empty or undefined, it falls back to a specified fallback value.
 *
 * @param content - The template string containing placeholders.
 * @param variable - The template variable name to replace.
 * @param value - The value to replace the variable with.
 * @param fallback - An optional fallback value if `value` is empty.
 * @returns A new string with the template variable replaced.
 *
 * @example
 * ```ts
 * const template = 'Hello {name}!';
 * const result = replaceTemplateVariable(template, 'name', 'Alice', 'User');
 * console.log(result); // 'Hello Alice!'
 * ```
 */
export function replaceTemplateVariable(
	content: string,
	variable: string,
	value: string | undefined,
	fallback?: string,
) {
	return content.replace(templateVariable(variable), (_, prefix) => {
		const val = value?.length ? value : fallback?.length ? fallback : ''
		return val ? `${prefix ? '\n\n' : ''}${val}` : ''
	})
}

/**
 * Expands a template string by replacing multiple template variables with their corresponding values.
 *
 * @param template - The template string containing placeholders.
 * @param values - An object mapping variable names to their respective values.
 * @returns A string with all template variables replaced.
 *
 * @example
 * ```ts
 * const template = 'Hello {name}, welcome to {place}!';
 * const values = { name: 'Alice', place: 'Wonderland' };
 * const result = expandTemplate(template, values);
 * console.log(result); // 'Hello Alice, welcome to Wonderland!'
 * ```
 */
export const expandTemplate = (
	template: string,
	variables: Record<string, string | undefined>,
) => {
	return Object.entries(variables).reduce(
		(result, [key, value]) => replaceTemplateVariable(result, key, value),
		template,
	)
}

/**
 * Generates a complete link by combining a domain, path, and an optional extension.
 *
 * @param domain - The base domain of the link (e.g., "https://example.com").
 * @param path - The path to append to the domain (e.g., "guide").
 * @param extension - An optional extension to append to the path (e.g., ".md").
 * @returns The generated link
 */
export const generateLink = (
	path: string,
	domain?: string,
	extension?: LinksExtension,
	cleanUrls?: VitePressConfig['cleanUrls'],
) =>
	expandTemplate('{domain}/{path}{extension}', {
		domain: domain || '',
		path,
		extension: cleanUrls ? '' : extension,
	})

/**
 * Options for generating metadata for markdown files.
 */
export interface GenerateMetadataOptions {
	/** Optional domain name to prepend to the URL. */
	domain?: LlmstxtSettings['domain']

	/** Path to the file relative to the content root. */
	filePath: string

	/** The link extension for generated links. */
	linksExtension?: LinksExtension

	/** Whether to use clean URLs (without the extension). */
	cleanUrls?: VitePressConfig['cleanUrls']
}

/**
 * Generates metadata for markdown files to provide additional context for LLMs.
 *
 * @param sourceFile - Parsed markdown file with frontmatter using gray-matter.
 * @param options - Options for generating metadata.
 * @returns Object containing metadata properties for the file.
 *
 * @example
 * generateMetadata(preparedFile, { domain: 'https://example.com', filePath: 'docs/guide' })
 * // Returns { url: 'https://example.com/docs/guide.md', description: 'A guide' }
 */
export function generateMetadata<GrayMatter extends GrayMatterFile<Input>>(
	sourceFile: GrayMatter,
	options: GenerateMetadataOptions,
) {
	const { domain, filePath, linksExtension, cleanUrls } = options
	const frontmatterMetadata: Record<string, string> = {}

	frontmatterMetadata.url = generateLink(
		stripExtPosix(filePath),
		domain,
		linksExtension ?? '.md',
		cleanUrls,
	)

	if (sourceFile.data?.description?.length) {
		frontmatterMetadata.description = sourceFile.data?.description
	}

	return frontmatterMetadata
}

/**
 * Returns a human-readable string representation of the given string's size in bytes.
 *
 * This function calculates the byte size of a given string by creating a `Blob`
 * and then converts it into a human-readable format using `byte-size`.
 *
 * @param string - The input string whose size needs to be determined.
 * @returns A human-readable size string (e.g., "1.2 KB", "500 B").
 */
export const getHumanReadableSizeOf = (string: string) =>
	byteSize(new Blob([string]).size).toString()
