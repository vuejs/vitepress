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

## description

- Type: `string`

Title for the page. It's same as [config.description](../config/app-configs#description), and it overrides the app config.

```yaml
---
description: VitePress
---
```

## layout

- Type: `doc | home | page`
- Default: `doc`

Determines the layout of the page.

- `doc` - It applies default documentation styles to the markdown content.
- `home` - Special layout for "Home Page". You may add extra options such as `hero` and `features` to rappidly create beautiful landing page.
- `page` - Behave similar to `doc` but it aplies no styles to the content. Useful when you want to create a fully custom page.

```yaml
---
type: doc
---
```

## hero

- Type: `Hero`

This option only take effect when `layout` is set to `home`.

It defines contents of home hero section.

```yaml
---
layout: home

hero:
  name: VuePress
  text: Vite & Vue powered static site generator.
  tagline: Lorem ipsum...
---
```

```ts
interface Hero {
  // The string shown top of `text`. Best used for product name.
  name: string

  // The main text for the hero section. This will be defined as `h1`.
  text: string

  // Tagline displayed below `text`.
  tagline: string
}
```
