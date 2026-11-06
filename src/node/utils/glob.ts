import path from 'node:path'

import { glob as _glob, escapePath } from 'tinyglobby'
import { normalizePath } from 'vite'

export interface GlobOptions {
  absolute?: boolean
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
  // the base path may contain glob characters, e.g. `~/Dropbox (Team)/docs`
  const escapedBase = escapePath(normalizePath(base))
  const resolve = (p: string) =>
    path.isAbsolute(p)
      ? normalizePath(path.resolve(p))
      : path.posix.join(escapedBase, normalizePath(p))
  return patterns.map((p) =>
    p[0] === '!' ? '!' + resolve(p.slice(1)) : resolve(p)
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
      ignore: ['**/node_modules/**', '**/dist/**'].concat(options?.ignore || [])
    })
  ).sort()
}
