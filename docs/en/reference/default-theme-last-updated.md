# Last Updated

The update time of the last content will be displayed in the lower right-hand corner of the page. To enable it, add `lastUpdated` options to your config.

::: tip
You need to commit the markdown file to see the updated time.
:::

## Site-Level Config

```js
export default {
  lastUpdated: true
}
```

## Frontmatter Config

This can be disabled on a per-page basis by using the `lastUpdated` option on frontmatter:

```yaml
---
lastUpdated: false
---
```

Also refer to [Default Theme: Last Updated](./default-theme-config#lastupdated) for more details. Any truthy value at the theme level will also enable the feature unless explicitly disabled at the site or page level.
