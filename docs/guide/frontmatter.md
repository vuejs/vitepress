# Frontmatter

Any Markdown file that contains a YAML frontmatter block will be processed by [gray-matter](https://github.com/jonschlinkert/gray-matter). The frontmatter must be at the top of the Markdown file, and must take the form of valid YAML set between triple-dashed lines. Example:

```md
---
title: Docs with VitePress
editLink: true
---
```

Many site or default theme config options have corresponding options in frontmatter. You can use frontmatter to override specific behavior for the current page only. For details, see [Frontmatter Config Reference](/reference/frontmatter-config),

You can also define custom frontmatter data of your own, to be used in dynamic Vue expressions on the page. Frontmatter data can be accessed via the special `$frontmatter` global variable:

Here's an example of how you could use it in your Markdown file:

```md
---
title: Docs with VitePress
editLink: true
---

# {{ $frontmatter.title }}

Guide content
```

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
