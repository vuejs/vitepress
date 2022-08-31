# Frontmatter Configs

Frontmatter enables page based configuration. On every markdown, you’re free to add Any settings to override any global app or theme configs. Also, there are configs which you can only define in Frontmatter.

```yaml
---
title: Docs with VitePress
editLink: true
---
```

You may access frontmatter by `$frontmatter` helper inside any markdown file.

```md
{{ $frontmatter.title }}
```

## title

- Type: `string`

Title for the page. It's same as [config.title](../config/app-configs#title), and it overrides the app config.

```yaml
---
title: VitePress
---
```

## titleTemplate

- Type: `string | boolean`

The suffix for the title. It's same as [config.titleTemplate](../config/app-configs#titletemplate), and it overrides the app config.

```yaml
---
title: VitePress
titleTemplate: Vite & Vue powered static site generator
---
```

## description

- Type: `string`

Title for the page. It's same as [config.description](../config/app-configs#description), and it overrides the app config.

```yaml
---
description: VitePress
---
```

### head

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
- `home` - Special layout for "Home Page". You may add extra options such as `hero` and `features` to rappidly create beautiful landing page.
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

```yaml
---
layout: home

features:
  - icon: ⚡️
    title: Vite, The DX that can't be beat
    details: Lorem ipsum...
  - icon: 🖖
    title: Power of Vue meets Markdown
    details: Lorem ipsum...
  - icon: 🛠️
    title: Simple and minimal, always
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // Show icon on each feature box. Currently, only emojis
  // are supported.
  icon?: string

  // Title of the feature.
  title: string

  // Details of the feature.
  details: string
}
```

## aside

- Type: `boolean`
- Default: `true`

If you want the right aside component in `doc` layout not to be shown, set this option to `false`.

```yaml
---
aside: false
---
```
