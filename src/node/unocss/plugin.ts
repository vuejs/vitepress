import type { UnoCSSConfig } from './types'
import UnocssPlugin from '@unocss/vite'
import { defineUnoCSSConfig } from './index'

export function UnoCSSPlugin<Theme extends object = object>(
  options?: UnoCSSConfig<Theme> | string
) {
  return typeof options === 'string'
    ? UnocssPlugin<Theme>(options)
    : UnocssPlugin<Theme>(defineUnoCSSConfig(options ?? {}))
}
