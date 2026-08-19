import MarkdownIt from 'markdown-it'
import type { UserConfig } from './siteConfig'
import { isObject } from './shared'

type AdditionalConfig = NonNullable<UserConfig['additionalConfig']>
type AdditionalConfigLoader = Extract<
  AdditionalConfig,
  (filePath: string) => unknown
>

const inlineMarkdown = new MarkdownIt({ html: true, linkify: true })

export function resolveDefaultThemeConfig<T>(themeConfig: T): T {
  if (!isObject(themeConfig)) return themeConfig

  const resolved = { ...themeConfig } as Record<string, any>

  if (Array.isArray(resolved.nav)) {
    resolved.nav = resolveNavItems(resolved.nav)
  }

  if (resolved.sidebar) {
    resolved.sidebar = resolveSidebar(resolved.sidebar)
  }

  if (isObject(resolved.docFooter)) {
    resolved.docFooter = resolveDocFooter(resolved.docFooter)
  }

  return resolved as T
}

export function resolveLocaleDefaultThemeConfigs<T>(
  locales: T | undefined
): T | undefined {
  if (!isObject(locales)) return locales

  return Object.fromEntries(
    Object.entries(locales).map(([key, locale]) => {
      if (!isObject(locale) || !isObject(locale.themeConfig)) {
        return [key, locale]
      }

      return [
        key,
        {
          ...locale,
          themeConfig: resolveDefaultThemeConfig(locale.themeConfig)
        }
      ]
    })
  ) as T
}

export function resolveAdditionalDefaultThemeConfigs<
  T extends AdditionalConfig
>(additionalConfig: T | undefined): T | undefined {
  if (!additionalConfig) return additionalConfig

  if (typeof additionalConfig === 'function') {
    return ((filePath: string) => {
      const configs = (additionalConfig as AdditionalConfigLoader)(filePath)
      return configs?.map(resolveAdditionalConfig)
    }) as T
  }

  return Object.fromEntries(
    Object.entries(additionalConfig).map(([key, config]) => [
      key,
      resolveAdditionalConfig(config)
    ])
  ) as T
}

function resolveAdditionalConfig<T>(config: T): T {
  if (!isObject(config) || !isObject(config.themeConfig)) {
    return config
  }

  return {
    ...config,
    themeConfig: resolveDefaultThemeConfig(config.themeConfig)
  }
}

function resolveNavItems<T>(items: T[]): T[] {
  return items.map(resolveNavItem)
}

function resolveNavItem<T>(item: T): T {
  if (!isObject(item)) return item

  const resolved = resolveText(item)

  if (Array.isArray(item.items)) {
    resolved.items = resolveNavItems(item.items)
  }

  return resolved as T
}

function resolveSidebar<T>(sidebar: T): T {
  if (Array.isArray(sidebar)) {
    return resolveSidebarItems(sidebar) as T
  }

  if (!isObject(sidebar)) return sidebar

  return Object.fromEntries(
    Object.entries(sidebar).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, resolveSidebarItems(value)]
      }

      if (isObject(value) && Array.isArray(value.items)) {
        return [key, { ...value, items: resolveSidebarItems(value.items) }]
      }

      return [key, value]
    })
  ) as T
}

function resolveSidebarItems<T>(items: T[]): T[] {
  return items.map(resolveSidebarItem)
}

function resolveSidebarItem<T>(item: T): T {
  if (!isObject(item)) return item

  const resolved = resolveText(item)

  if (typeof item.docFooterText === 'string') {
    resolved.docFooterText = renderInlineMarkdown(item.docFooterText)
  }

  if (Array.isArray(item.items)) {
    resolved.items = resolveSidebarItems(item.items)
  }

  return resolved as T
}

function resolveDocFooter<T>(docFooter: T): T {
  if (!isObject(docFooter)) return docFooter

  const resolved = { ...docFooter } as Record<string, any>

  if (typeof docFooter.prev === 'string') {
    resolved.prev = renderInlineMarkdown(docFooter.prev)
  }

  if (typeof docFooter.next === 'string') {
    resolved.next = renderInlineMarkdown(docFooter.next)
  }

  return resolved as T
}

function resolveText<T>(item: T): Record<string, any> {
  const resolved = { ...item } as Record<string, any>

  if (typeof (item as Record<string, any>).text === 'string') {
    resolved.text = renderInlineMarkdown((item as Record<string, any>).text)
  }

  return resolved
}

function renderInlineMarkdown(text: string): string {
  return inlineMarkdown.renderInline(text)
}
