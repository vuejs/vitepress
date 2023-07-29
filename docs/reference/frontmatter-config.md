---
outline: deep
---

# Frontmatter Config

Frontmatter enables page based configuration. In every markdown file, you can use frontmatter config to override site-level or theme-level config options. Also, there are config options which you can only define in frontmatter.

Example usage:

```md
---
title: Docs with VitePress
editLink: true
---
```

You can access frontmatter data via the `$frontmatter` global in Vue expressions:

```md
{{ $frontmatter.title }}
```

## title

- Type: `string`

Title for the page. It's same as [config.title](./site-config#title), and it overrides the site-level config.

```yaml
---
title: VitePress
---
```

## titleTemplate

- Type: `string | boolean`

The suffix for the title. It's same as [config.titleTemplate](./site-config#titletemplate), and it overrides the site-level config.

```yaml
---
title: VitePress
titleTemplate: Vite & Vue powered static site generator
---
```

## description

- Type: `string`

Description for the page. It's same as [config.description](./site-config#description), and it overrides the site-level config.

```yaml
---
description: VitePress
---
```

## head

- Type: `HeadConfig[]`

Specify extra head tags to be injected for the current page. Will be appended after head tags injected by site-level config.

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

## Default Theme Only

The following frontmatter options are only applicable when using the default theme.

### layout

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

### hero <Badge type="info" text="home page only" />

Defines contents of home hero section when `layout` is set to `home`. More details in [Default Theme: Home Page](./default-theme-home-page).

### features <Badge type="info" text="home page only" />

Defines items to display in features section when `layout` is set to `home`. More details in [Default Theme: Home Page](./default-theme-home-page).

### navbar

- Type: `boolean`
- Default: `true`

Whether to display [navbar](./default-theme-nav).

```yaml
---
navbar: false
---
```

### sidebar

- Type: `boolean`
- Default: `true`

Whether to display [sidebar](./default-theme-sidebar).

```yaml
---
sidebar: false
---
```

### aside

- Type: `boolean | 'left'`
- Default: `true`

Defines the location of the aside component in the `doc` layout.

Setting this value to `false` prevents rendering of aside container.\
Setting this value to `true` renders the aside to the right.\
Setting this value to `'left'` renders the aside to the left.

```yaml
---
aside: false
---
```

### outline

- Type: `number | [number, number] | 'deep' | false`
- Default: `2`

The levels of header in the outline to display for the page. It's same as [config.themeConfig.outline](./default-theme-config#outline), and it overrides the theme config.

### lastUpdated

- Type: `boolean`
- Default: `true`

Whether to display [last updated](./default-theme-last-updated) text in the footer of the current page.

```yaml
---
lastUpdated: false
---
```

### editLink

- Type: `boolean`
- Default: `true`

Whether to display [edit link](./default-theme-edit-link) in the footer of the current page.

```yaml
---
editLink: false
---
```

### footer

- Type: `boolean`
- Default: `true`

Whether to display [footer](./default-theme-footer).

```yaml
---
footer: false
---
```

### pageClass

- Type: `string`

Add extra class name to a specific page.

```yaml
---
pageClass: custom-page-class
---
```

Then you can customize styles of this specific page in `.vitepress/theme/custom.css` file:

```css
.custom-page-class {
  /* page-specific styles */
}
```
