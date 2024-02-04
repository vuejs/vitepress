import type { PresetOrFactory } from '@unocss/core'
import type { VitePluginConfig } from '@unocss/vite'
import type { UnoCSSConfig } from './types'
import { createIconsPreset } from './icons'

export * from './types'

export function defineUnoCSSConfig<Theme extends object>(
  options: UnoCSSConfig<Theme>
) {
  const { iconsOptions, overrideIcons, ...unocss } = options
  const { presets = [], ...config } = unocss
  return {
    ...config,
    presets: [
      ...presets,
      createIconsPreset(iconsOptions, overrideIcons)
    ].filter((p) => !!p) as (
      | PresetOrFactory<Theme>
      | PresetOrFactory<Theme>[]
    )[]
  } satisfies VitePluginConfig<Theme>
}
