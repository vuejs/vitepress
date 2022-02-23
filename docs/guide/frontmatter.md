# Frontmatter

Any Markdown file that contains a YAML frontmatter block will be processed by [gray-matter](https://github.com/jonschlinkert/gray-matter). The frontmatter must be at the top of the Markdown file, and must take the form of valid YAML set between triple-dashed lines. Example:

```md
---
title: Docs with VitePress
editLink: true
---
```

Between the triple-dashed lines, you can set [predefined variables](#predefined-variables), or even create custom ones of your own. These variables can be used via the special <code>$frontmatter</code> variable.

Here’s an example of how you could use it in your Markdown file:

```md
---
title: Docs with VitePress
editLink: true
---

# {{ $frontmatter.title }}

Guide content
```

## Alternative frontmatter Formats

VitePress also supports JSON frontmatter syntax, starting and ending in curly braces:

```json
---
{
  "title": "Blogging Like a Hacker",
  "editLink": true
}
---
```

## Predefined Variables

### title

- Type: `string`
- Default: `h1_title || siteData.title`

Title of the current page.

### head

- Type: `array`
- Default: `undefined`

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

### navbar

- Type: `boolean`
- Default: `undefined`

You can disable the navbar on a specific page with `navbar: false`

### sidebar

- Type: `boolean|'auto'`
- Default: `undefined`

You can decide to show the sidebar on a specific page with `sidebar: auto` or disable it with `sidebar: false`

### editLink

- Type: `boolean`
- Default: `undefined`

Define if this page should include an edit link.
