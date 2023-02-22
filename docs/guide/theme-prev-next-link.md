# Prev Next Link

You can customize the text and the link of the previous and next page. This is helpful if you want to show a different text/link on the previous/next page than what you have on your sidebar or if your page is not even listed on the sidebar.


## prev

text: `string`

-   Specify the text to show for the link to the previous page.
    If you don't set this in frontmatter, the text will be inferred from the sidebar config.

link: `string | false`

-   Specify the url which the previous page should point to.
    If you don't set this in frontmatter, the url will be inferred from the sidebar config.

Only change the text of the link:

```yaml
---
prev:
  text: 'Getting Started'
---
```

Change the text and the link itself:

```yaml
---
prev:
  text: 'Markdown'
  link: '/guide/markdown'
---
```

If you don't want a link to be displayed on a specific page you can also disable it:

```yaml
---
prev:
  link: false
---
```

## next

text: `string`

link: `string | false`

Same as `prev` but for the next page.

```yaml
---
next:
  text: 'Next Page'
  link: '/guide/asset-handling'
---
