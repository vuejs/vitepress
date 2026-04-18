# Created

The created time of the content will be displayed in the lower right corner of the page. To enable it, add `created` options to your config.

::: info
VitePress displays the "created" time using the timestamp of the first Git commit for each file. To enable this, the Markdown file must be committed to Git.

Internally, VitePress runs `git log -1 --pretty=%at --follow --diff-filter=A` on each file to retrieve its timestamp. If all pages show the same created time, please refer to the same paragraph on the [Last Updated](./default-theme-last-updated) page.
:::

## Site-Level Config

```js
export default {
  created: true
}
```

## Frontmatter Config

This can be disabled per-page using the `created` option on frontmatter:

```yaml
---
created: false
---
```

Also refer [Default Theme: Created](./default-theme-config#created) for more details. Any truthy value at theme-level will also enable the feature unless explicitly disabled at site or page level.
