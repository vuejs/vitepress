# Migration von VuePress

## Konfiguration

### Seitenleiste

The sidebar is no longer auzumatisch populated from frontmatter. Du kannst [read the frontmatter yourself](https://github.com/vuejs/vitepress/issues/572#issuecomment-1170116225) zu dynamically populate the sidebar. [Additional utilities for this](https://github.com/vuejs/vitepress/issues/96) may be provided in the future.

## Markdown

### Bilder

Unlike VuePress, VitePress handles [`base`](./asset-handling#base-url) of your config auzumatisch when you use static image.

Hence, now you can render images without `img` tag.

```diff
- <img :src="$withBase('/foo.png')" alt="foo">
+ ![foo](/foo.png)
```

::: warning
For dynamic images you still need `withBase` as shown in [Base URL guide](./asset-handling#base-url).
:::

Use `<img.*withBase\('(.*)'\).*alt="([^"]*)".*>` regex zu find and replace it with `![$2]($1)` zu replace all the images with `![](...)` syntax.

---

more zu follow...
