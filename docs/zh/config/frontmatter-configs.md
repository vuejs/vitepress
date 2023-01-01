# Frontmatter 配置 {#frontmatter-configs}

Frontmatter 支持基于页面的配置。在每个标签上，你可以自由地添加任何设置来覆盖任何全局应用或主题配置。此外，还有一些配置，你只能在 Frontmatter 中定义。

```yaml
---
title: Docs with VitePress
editLink: true
---
```

你可以通过 `$frontmatter` 在任何 markdown 文件中访问 frontmatter。

```md
{{ $frontmatter.title }}
```

## title

- Type: `string`

页面的标题。它与 [config.title](../config/app-configs#title) 相同，并覆盖了应用全局配置。

```yaml
---
title: VitePress
---
```

## titleTemplate

- Type: `string | boolean`

标题的后缀。它与 [config.titleTemplate](../config/app-configs#titletemplate) 相同，并覆盖了应用全局配置。

```yaml
---
title: VitePress
titleTemplate: Vite & Vue powered static site generator
---
```

## description

- Type: `string`

页面的描述。它与 [config.description](../config/app-configs#description) 相同，并覆盖了应用全局配置。

```yaml
---
description: VitePress
---
```

### head

- Type: `HeadConfig[]`

指定要注入的额外 head 标签。

```yaml
---
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: super duper SEO
---
```

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## lastUpdated

- Type: `boolean`
- Default: `true`

在当前页面是否显示[最后更新](../guide/theme-last-updated)文本。

```yaml
---
lastUpdated: false
---
```

## layout

- Type: `doc | home | page`
- Default: `doc`

决定页面的布局。

- `doc` - It applies default documentation styles to the markdown content.
- `home` - Special layout for "Home Page". You may add extra options such as `hero` and `features` to rapidly create beautiful landing page.
- `page` - Behave similar to `doc` but it applies no styles to the content. Useful when you want to create a fully custom page.

```yaml
---
layout: doc
---
```

## hero

- Type: `Hero`

This option only takes effect when `layout` is set to `home`.

It defines contents of home hero section.

```yaml
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue powered static site generator.
  tagline: Lorem ipsum...
  actions:
    - theme: brand
      text: Get Started
      link: /guide/what-is-vitepress
    - theme: alt
      text: View on GitHub
      link: https://github.com/vuejs/vitepress
---
```

```ts
interface Hero {
  // The string shown top of `text`. Comes with brand color
  // and expected to be short, such as product name.
  name?: string

  // The main text for the hero section. This will be defined
  // as `h1` tag.
  text: string

  // Tagline displayed below `text`.
  tagline?: string

  // Action buttons to display in home hero section.
  actions?: HeroAction[]
}

interface HeroAction {
  // Color theme of the button. Defaults to `brand`.
  theme?: 'brand' | 'alt'

  // Label of the button.
  text: string

  // Destination link of the button.
  link: string
}
```

## features

- Type: `Feature[]`

This option only takes effect when `layout` is set to `home`.

It defines items to display in features section.

You may learn more about it in [Theme: Home Page](../guide/theme-home-page).

## aside

- Type: `boolean`
- Default: `true`

If you want the right aside component in `doc` layout not to be shown, set this option to `false`.

```yaml
---
aside: false
---
```

## outline

- Type: `number | [number, number] | 'deep' | false`
- Default: `2`

The levels of header in the outline to display for the page. It's same as [config.themeConfig.outline](../config/theme-configs#outline), and it overrides the theme config.
