# Last Updated

The update time of the last content will be displayed in the lower right corner of the page. To enable it, add `lastUpdated` options to your config.

::: info
VitePress displays the "last updated" time using the timestamp of the most recent Git commit for each file. To enable this, the Markdown file must be committed to Git.

Internally, VitePress runs `git log -1 --pretty="%ai"` on each file to retrieve its timestamp. If all pages show the same update time, it's likely due to shallow cloning (common in CI environments), which limits Git history.

To fix this in **GitHub Actions**, use the following in your workflow:

```yaml{4}
- name: Checkout
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

Other CI/CD platforms have similar settings.

If such options aren't available, you can prepend the `docs:build` command in your `package.json` with a manual fetch:

```json
"docs:build": "git fetch --unshallow && vitepress build docs"
```
:::

## Site-Level Config

```js
export default {
  lastUpdated: true
}
```

## Frontmatter Config

This can be disabled per-page using the `lastUpdated` option on frontmatter:

```yaml
---
lastUpdated: false
---
```

Also refer [Default Theme: Last Updated](./default-theme-config#lastupdated) for more details. Any truthy value at theme-level will also enable the feature unless explicitly disabled at site or page level.
