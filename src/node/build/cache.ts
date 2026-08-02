import { disposeMdItInstance } from '../markdown/markdown'
import { clearCache } from '../markdownToVue'

export function clearBuildCaches(): void {
  clearCache()
}

export function disposeBuildCaches(): void {
  clearBuildCaches()
  disposeMdItInstance()
}

export function collectGarbageAtPhaseBoundary(): void {
  ;(globalThis as typeof globalThis & { gc?: () => void }).gc?.()
}
