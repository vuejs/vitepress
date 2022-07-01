# Prev Next Link

Prev or Next Link allows you to add buttons at the end of each page that allow you to go to the previous or next topic. To enable it, add `themeConfig.prev` or `themeConfig.next` to your configuration.


## prev

- Type: `NavLink | string`

- Details:

  Specify the link of the previous page.

  If you don't set this frontmatter, the link will be inferred from the sidebar config.

  To configure the prev link manually, you can set this frontmatter to a `NavLink` object or a string:

  - A `NavLink` object should have a `text` field and a `link` field.
  - A string should be the path to the target page file. It will be converted to a `NavLink` object, whose `text` is the page title, and `link` is the page route path.

- Example:

```md
---
# NavLink
prev:
  text: Get Started
  link: /guide/getting-started.html

# NavLink - external url
prev:
  text: GitHub
  link: https://github.com

# string - page file path
prev: /guide/getting-started.md

# string - page file relative path
prev: ../../guide/getting-started.md
---
```

## next

- Type: `NavLink | string`

- Details:

  Specify the link of the next page.

  If you don't set this frontmatter, the link will be inferred from the sidebar config.

  The type is the same as [prev](#prev) frontmatter.
