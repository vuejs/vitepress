import type { VitePluginConfig } from '@unocss/vite'
import type { IconsOptions as UnoCSSIcons } from '@unocss/preset-icons'
import type { Awaitable } from '../../../types'

export type Icons =
  | 'discord'
  | 'facebook'
  | 'github'
  | 'instagram'
  | 'linkedin'
  | 'mastodon'
  | 'npm'
  | 'slack'
  | 'twitter'
  | 'x'
  | 'youtube'
  | 'heart'
  | 'edit-link'

interface Nothing {}
/**
 * Adapted from https://github.com/microsoft/TypeScript/issues/29729
 */
export type StringLiteralUnion<T extends U, U = string> = T | (U & Nothing)
export type VitePressIcons = StringLiteralUnion<Icons>

/**
 * VitePress UnoCSS Preset Icons options.
 */
export interface UnoCSSConfig<Theme extends object = object>
  extends VitePluginConfig<Theme> {
  /**
   * UnoCSS PReset Icons options.
   */
  iconsOptions?: UnoCSSIcons
  /**
   * Change built-in VitePress icons.
   */
  overrideIcons?: Record<
    VitePressIcons,
    (() => Awaitable<string>) | Awaitable<string>
  >
}
