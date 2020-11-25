# Global Computed

In VitePress, some core [computed properties](https://v3.vuejs.org/guide/computed.html#computed-properties) can be used by the default theme or custom themes. Or directly in Markdown pages using vue, for example using `{{ $frontmatter.title }}` to access the title defined in the frontmatter section of the page.

## \$site

This is the `$site` value of the site you’re currently reading:

```json
{
  "title": "VitePress",
  "description": "Vite & Vue powered static site generator.",
  "lang": "en-US",
  "locales": {},
  "base": "/",
  "head": [],
  "themeConfig: $theme
}
```

## \$page

This is the `$page` value of the page you’re currently reading:

```json
{
  "title": "Global Computed",
  "relativePath": "guide/global-computed.md",
  "lastUpdated": 1606297645000
  "headers": [
    {
      "level": 2,
      "title": "$site",
      "slug": "site"
    },
    {
      "level": 2,
      "title": "$page",
      "slug": "$page"
    },
    ...
  ],
  "frontmatter": $frontmatter,
}
```

## \$frontmatter

Reference of [\$page](#page).frontmatter.

```json
{
  "title": "Docs with VitePress",
  "editLink": true
}
```

## \$theme

Refers to `$site.themeConfig`.

```json
{
  "repo": "vuejs/vitepress",
  "docsDir": "docs",
  "locales": {},
  "editLinks": true,
  "editLinkText": "Edit this page on GitHub",
  "lastUpdated": "Last Updated",
  "nav": [
    {
      "text": "Guide",
      "link": "/"
    },
    ...
  ],
  "sidebar": {
    "/": [
      {
        "text": "Introduction",
        "children": [
          {
            "text": "What is VitePress?",
            "link": "/"
          },
          ...
        ]
      }
    ],
    "/guide/": [
      {
        "text": "Introduction",
        "children": [
          {
            "text": "What is VitePress?",
            "link": "/"
          },
          ...
        ]
      }
    ],
    ...
  },
}
```
