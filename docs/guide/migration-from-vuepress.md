# Migration from VuePress

## Markdown

### Images

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
