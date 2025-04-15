import path from 'node:path'
import type { DefaultTheme } from 'vitepress'
import type {
	LinksExtension,
	LlmstxtSettings,
	PreparedFile,
	VitePressConfig,
} from '../types'
import { generateLink, stripExtPosix } from './utils'

/**
 * Generates a Markdown-formatted table of contents (TOC) link for a given file.
 *
 * @param file - The prepared file.
 * @param domain - The base domain for the generated link.
 * @param relativePath - The relative path of the file, which is converted to a `.md` link.
 * @param extension - The link extension for the generated link (default is `.md`).
 * @param cleanUrls - Whether to use clean URLs (without the extension).
 * @returns The formatted TOC entry as a Markdown list item.
 */
export const generateTOCLink = (
	file: PreparedFile,
	domain: LlmstxtSettings['domain'],
	relativePath: string,
	extension?: LinksExtension,
	cleanUrls: VitePressConfig['cleanUrls'] = false,
) => {
	const description: string = file.file.data.description
	return `- [${file.title}](${generateLink(stripExtPosix(relativePath), domain, extension ?? '.md', cleanUrls)})${description ? `: ${description.trim()}` : ''}\n`
}

/**
 * Recursively collects all paths from sidebar items.
 *
 * @param items - Array of sidebar items to process.
 * @returns Array of paths collected from the sidebar items.
 */
function collectPathsFromSidebarItems(
	items: DefaultTheme.SidebarItem[],
): string[] {
	const paths: string[] = []

	for (const item of items) {
		// Add the current item's path if it exists
		if (item.link) {
			paths.push(item.link)
		}

		// Recursively add paths from nested items
		if (item.items && Array.isArray(item.items)) {
			paths.push(...collectPathsFromSidebarItems(item.items))
		}
	}

	return paths
}

/**
 * Normalizes link path for comparison, handling both index.md and directory paths.
 *
 * @param link - The link path to normalize.
 * @returns Normalized link path for consistent comparison.
 */
export function normalizeLinkPath(link: string): string {
	const normalizedPath = stripExtPosix(link)

	if (path.basename(normalizedPath) === 'index') {
		return path.dirname(normalizedPath)
	}

	return normalizedPath
}

/**
 * Checks if a file path matches a sidebar path, handling various path formats.
 *
 * @param filePath - The file path to check.
 * @param sidebarPath - The sidebar path to compare against.
 * @returns True if paths match, false otherwise
 */
export function isPathMatch(filePath: string, sidebarPath: string): boolean {
	const normalizedFilePath = normalizeLinkPath(filePath)
	const normalizedSidebarPath = normalizeLinkPath(sidebarPath)

	return (
		normalizedFilePath === normalizedSidebarPath ||
		normalizedFilePath === `${normalizedSidebarPath}.md`
	)
}

/**
 * Processes sidebar items and generates TOC entries in the exact order they appear in sidebar config
 *
 * @param section - A sidebar section
 * @param preparedFiles - An array of prepared files
 * @param srcDir - The VitePress source directory
 * @param domain - Optional domain to prefix URLs with
 * @param linksExtension - The link extension for generated links.
 * @param depth - Current depth level for headings
 * @returns A string representing the formatted section of the TOC
 */
async function processSidebarSection(
	section: DefaultTheme.SidebarItem,
	preparedFiles: PreparedFile[],
	srcDir: VitePressConfig['vitepress']['srcDir'],
	domain?: LlmstxtSettings['domain'],
	linksExtension?: LinksExtension,
	cleanUrls?: VitePressConfig['cleanUrls'],
	depth = 3,
): Promise<string> {
	let sectionTOC = ''

	// Add section header only if it has text and is not just a link container
	if (section.text) {
		sectionTOC += `${'#'.repeat(depth)} ${section.text}\n\n`
	}

	// Process items in this section
	if (section.items && Array.isArray(section.items)) {
		const linkItems: string[] = []
		const nestedSections: string[] = []

		// First pass: separate link items and nested sections
		await Promise.all(
			section.items.map(async (item) => {
				// Process nested sections
				if (item.items && item.items.length > 0) {
					const processedSection = await processSidebarSection(
						item,
						preparedFiles,
						srcDir,
						domain,
						linksExtension,
						cleanUrls,
						// Increase depth for nested sections to maintain proper heading levels
						depth + 1,
					)
					nestedSections.push(processedSection)
				}
				// Process link items
				else if (item.link) {
					// Normalize the link for matching
					const normalizedItemLink = normalizeLinkPath(item.link)

					const matchingFile = preparedFiles.find((file) => {
						const relativePath = `/${stripExtPosix(path.relative(srcDir, file.path))}`
						return isPathMatch(relativePath, normalizedItemLink)
					})

					if (matchingFile) {
						const relativePath = path.relative(srcDir, matchingFile.path)
						linkItems.push(
							generateTOCLink(
								matchingFile,
								domain,
								relativePath,
								linksExtension,
								cleanUrls,
							),
						)
					}
				}
			}),
		)

		// Add link items if any
		if (linkItems.length > 0) {
			sectionTOC += linkItems.join('')
		}

		// Add a blank line before nested sections if we have link items
		if (linkItems.length > 0 && nestedSections.length > 0) {
			sectionTOC += '\n'
		}

		// Add nested sections with appropriate spacing
		if (nestedSections.length > 0) {
			sectionTOC += nestedSections.join('\n')
		}
	}

	return sectionTOC
}

/**
 * Flattens the sidebar configuration when it's an object with path keys.
 *
 * @param sidebarConfig - The sidebar configuration from VitePress.
 * @returns An array of sidebar items.
 */
function flattenSidebarConfig(
	sidebarConfig: DefaultTheme.Sidebar,
): DefaultTheme.SidebarItem[] {
	// If it's already an array, return as is
	if (Array.isArray(sidebarConfig)) {
		return sidebarConfig
	}

	// If it's an object with path keys, flatten it
	if (typeof sidebarConfig === 'object') {
		return Object.values(sidebarConfig).flat()
	}

	// If it's neither, return an empty array
	return []
}

/**
 * Options for generating a Table of Contents (TOC).
 */
export interface GenerateTOCOptions {
	/**
	 * The VitePress source directory.
	 */
	srcDir: VitePressConfig['vitepress']['srcDir']

	/**
	 * Optional domain to prefix URLs with.
	 */
	domain?: LlmstxtSettings['domain']

	/**
	 * Optional VitePress sidebar configuration.
	 */
	sidebarConfig?: DefaultTheme.Sidebar

	/** The link extension for generated links. */
	linksExtension?: LinksExtension

	/** Whether to use clean URLs (without the extension). */
	cleanUrls?: VitePressConfig['cleanUrls']
}

/**
 * Generates a Table of Contents (TOC) for the provided prepared files.
 *
 * Each entry in the TOC is formatted as a markdown link to the corresponding
 * text file. If a VitePress sidebar configuration is provided, the TOC will be
 * organized into sections based on the sidebar structure, with heading levels (#, ##, ###)
 * reflecting the nesting depth of the sections.
 *
 * @param preparedFiles - An array of prepared files.
 * @param options - Options for generating the TOC.
 * @returns A string representing the formatted Table of Contents.
 */
export async function generateTOC(
	preparedFiles: PreparedFile[],
	options: GenerateTOCOptions,
): Promise<string> {
	const { srcDir, domain, sidebarConfig, linksExtension, cleanUrls } = options
	let tableOfContent = ''

	let filesToProcess = preparedFiles

	// If sidebar configuration exists
	if (sidebarConfig) {
		// Flatten sidebar config if it's an object with path keys
		const flattenedSidebarConfig = flattenSidebarConfig(sidebarConfig)

		// Process each top-level section in the flattened sidebar
		if (flattenedSidebarConfig.length > 0) {
			for (const section of flattenedSidebarConfig) {
				tableOfContent += await processSidebarSection(
					section,
					filesToProcess,
					srcDir,
					domain,
					linksExtension,
					cleanUrls,
				)

				// tableOfContent = `${tableOfContent.trimEnd()}\n\n`
				tableOfContent += '\n'
			}

			// Find files that didn't match any section
			const allSidebarPaths = collectPathsFromSidebarItems(
				flattenedSidebarConfig,
			)
			const unsortedFiles = filesToProcess.filter((file) => {
				const relativePath = `/${stripExtPosix(path.relative(srcDir, file.path))}`
				return !allSidebarPaths.some((sidebarPath) =>
					isPathMatch(relativePath, sidebarPath),
				)
			})

			// Add files that didn't match any section
			if (unsortedFiles.length > 0) {
				tableOfContent += '### Other\n\n'
				filesToProcess = unsortedFiles
			}
		}
	}

	const tocEntries: string[] = []

	await Promise.all(
		filesToProcess.map(async (file) => {
			const relativePath = path.relative(srcDir, file.path)
			tocEntries.push(
				generateTOCLink(file, domain, relativePath, linksExtension, cleanUrls),
			)
		}),
	)

	tableOfContent += tocEntries.join('')

	return tableOfContent
}
