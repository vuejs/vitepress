# Frontmatter

## Usage

VitePress supports YAML frontmatter in all Markdown files, parsing them with [gray-matter](https://github.com/jonschlinkert/gray-matter). The frontmatter must be at the top of the Markdown file (before any elements including `<script>` tags), and must take the form of valid YAML set between triple-dashed lines. Example:

```md
---
title: Docs with VitePress
editLink: true
---
```

Many site or default theme config options have corresponding options in frontmatter. You can use frontmatter to override specific behavior for the current page only. For details, see [Frontmatter Config Reference](/reference/frontmatter-config).

You can also define custom frontmatter data of your own, to be used in dynamic Vue expressions on the page.

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

You can also access current page's frontmatter data in `<script setup>` with the [`useData()`](/reference/runtime-api#usedata) helper.

## Alternative Frontmatter Formats

VitePress also supports JSON frontmatter syntax, starting and ending in curly braces:

```json
---
{
  "title": "Blogging Like a Hacker",
  "editLink": true
}
---
```
