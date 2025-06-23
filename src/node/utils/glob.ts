import path from 'node:path'
import { glob } from 'tinyglobby'
import { normalizePath } from 'vite'

export interface GlobOptions {
  cwd?: string
  ignore?: string | string[]
  dot?: boolean
  debug?: boolean
}

export function normalizeWatchPatterns(
  patterns: string[] | string | undefined,
  base: string
): string[] {
  if (!patterns) return []
  if (typeof patterns === 'string') patterns = [patterns]
  return patterns.map((p) =>
    p.startsWith('.') ? normalizePath(path.resolve(base, p)) : normalizePath(p)
  )
}

export async function getWatchedFiles(
  patterns: string[] | undefined,
  options?: GlobOptions
): Promise<string[]> {
  if (!patterns?.length) return []
  return (
    await glob(patterns, {
      ignore: ['**/node_modules/**', '**/dist/**', ...(options?.ignore || [])],
      expandDirectories: false,
      ...options
    })
  ).sort()
}
