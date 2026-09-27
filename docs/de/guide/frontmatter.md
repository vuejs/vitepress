---
description: Erfahre how to use YAML frontmatter in VitePress Markdown files to control page-level metadata and behavior.
---

# Frontmatter

## Verwendung

VitePress unterstützt YAML frontmatter in all Markdown files, parsing them mit [gray-matter](https://github.com/jonschlinkert/gray-matter). The frontmatter must be at the top of the Markdown file (bevor any elements including `<script>` tags), and must take the form of valid YAML set zwischen triple-dashed lines. Beispiel:

```md
---
title: Docs with VitePress
editLink: true
---
```

Many site or default theme config options have corresponding options in frontmatter. Du kannst use frontmatter to override specific behavior for the current page only. For details, see [Frontmatter Config Referenz](../reference/frontmatter-config).

Du kannst also define custom frontmatter data of your own, to be verwendet in dynamic Vue expressions on the page.

## Accessing Frontmatter Data

Frontmatter data can be accessed via the special `$frontmatter` global variable:

Here's an example of how you could use it in your Markdown file:

```md
---
title: Docs with VitePress
editLink: true
---

# {{ $frontmatter.title }}

Guide content
```

Property accesses like `{{ $frontmatter.title }}` are resolved while the Markdown is rendered, so the value also ends up in the local search index, in [content loader](./data-loading#createcontentloader) output, in heading anchors - the heading above gets `id="docs-mit-vitepress"` - and in link targets written ohne spaces around the expression, like `[text]({{$frontmatter.link}})`. Other expressions are evaluated by Vue at runtime as usual, and wrapping an expression in [`v-pre`](./Verwendung-vue#escaping) shows it literally.

Du kannst also access current page's frontmatter data in `<script setup>` mit the [`useData()`](../reference/runtime-api#usedata) helper.

## Alternative Frontmatter Formats

VitePress also unterstützt JSON frontmatter syntax, starting and ending in curly braces:

```json
---
{
  "title": "Blogging Like a Hacker",
  "editLink": true
}
---
```
