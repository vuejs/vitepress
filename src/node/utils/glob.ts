import path from 'node:path'
import { glob as _glob } from 'tinyglobby'
import { normalizePath } from 'vite'

export interface GlobOptions {
  cwd?: string
  ignore?: string | string[]
  dot?: boolean
  debug?: boolean
}

export function normalizeGlob(
  patterns: string[] | string | undefined,
  base: string
): string[] {
  if (!patterns) return []
  if (typeof patterns === 'string') patterns = [patterns]
  return patterns.map((p) =>
    p.startsWith('.') ? normalizePath(path.resolve(base, p)) : normalizePath(p)
  )
}

export async function glob(
  patterns: string[] | undefined,
  options?: GlobOptions
): Promise<string[]> {
  if (!patterns?.length) return []
  return (
    await _glob(patterns, {
      expandDirectories: false,
      ...options,
      ignore: ['**/node_modules/**', '**/dist/**', ...(options?.ignore || [])]
    })
  ).sort()
}
