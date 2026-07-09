# Migration from VuePress {#migration-from-vuepress}

## Config {#config}

### Sidebar {#sidebar}

The sidebar is no longer automatically populated from frontmatter. You can [read the frontmatter yourself](https://github.com/vuejs/vitepress/issues/572#issuecomment-1170116225) to dynamically populate the sidebar. [Additional utilities for this](https://github.com/vuejs/vitepress/issues/96) may be provided in the future.

## Markdown {#markdown}

### Images {#images}

Unlike VuePress, VitePress handles [`base`](./asset-handling#base-url) of your config automatically when you use static image.

Hence, now you can render images without `img` tag.

```diff
- <img :src="$withBase('/foo.png')" alt="foo">
+ ![foo](/foo.png)
```

::: warning
For dynamic images you still need `withBase` as shown in [Base URL guide](./asset-handling#base-url).
:::

Use `<img.*withBase\('(.*)'\).*alt="([^"]*)".*>` regex to find and replace it with `![$2]($1)` to replace all the images with `![](...)` syntax.

---

more to follow...
