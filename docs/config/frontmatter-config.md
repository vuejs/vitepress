# Frontmatter Config

Frontmatter enables page based configuration. In every markdown file, you can use frontmatter config to override app-level or theme config options. Also, there are config options which you can only define in frontmatter.

```yaml
---
title: Docs with VitePress
editLink: true
---
```

You can access frontmatter by `$frontmatter` helper inside any markdown file.

```md
{{ $frontmatter.title }}
```

## title

- Type: `string`

Title for the page. It's same as [config.title](../config/app-config#title), and it overrides the app config.

```yaml
---
title: VitePress
---
```

## titleTemplate

- Type: `string | boolean`

The suffix for the title. It's same as [config.titleTemplate](../config/app-config#titletemplate), and it overrides the app config.

```yaml
---
title: VitePress
titleTemplate: Vite & Vue powered static site generator
---
```

## description

- Type: `string`

Description for the page. It's same as [config.description](../config/app-config#description), and it overrides the app config.

```yaml
---
description: VitePress
---
```

## head

- Type: `HeadConfig[]`

Specify extra head tags to be injected:

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

Whether to display [Last Updated](../guide/theme-last-updated) text in the current page.

```yaml
---
lastUpdated: false
---
```

## layout

- Type: `doc | home | page`
- Default: `doc`

Determines the layout of the page.

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

The levels of header in the outline to display for the page. It's same as [config.themeConfig.outline](../config/theme-config#outline), and it overrides the theme config.
