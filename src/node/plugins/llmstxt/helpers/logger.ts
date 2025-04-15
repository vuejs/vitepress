import pc from 'picocolors'

/**
 * Log prefix styling with the plugin name and separator.
 * @constant {string}
 */
const logPrefix = pc.blue('llmstxt') + pc.dim(' » ')

/** Logger object with standardized logging methods. */
const log = {
	/**
	 * Logs an informational message to the console.
	 *
	 * @param message - The message to log.
	 */
	info: (message: string) => console.log(`${logPrefix}  ${message}`),

	/**
	 * Logs a success message to the console.
	 *
	 * @param message - The message to log.
	 */
	success: (message: string) =>
		console.log(`${logPrefix}${pc.green('✓')} ${message}`),

	/**
	 * Logs a warning message to the console.
	 *
	 * @param message - The message to log.
	 */
	warn: (message: string) =>
		console.warn(`${logPrefix}${pc.yellow('⚠')} ${pc.yellow(message)}`),

	/**
	 * Logs an error message to the console.
	 *
	 * @param message - The message to log.
	 */
	error: (message: string) =>
		console.error(`${logPrefix}${pc.red('✗')} ${pc.red(message)}`),
}

export default log
