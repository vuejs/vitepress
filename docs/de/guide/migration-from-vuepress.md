# Migration von VuePress

## Konfiguration

### Seitenleiste

Die Seitenleiste wird nicht mehr automatisch aus dem Frontmatter erzeugt. Du kannst [das Frontmatter selbst auslesen](https://github.com/vuejs/vitepress/issues/572#issuecomment-1170116225), um die Seitenleiste dynamisch zu erzeugen. [Zusätzliche Hilfsfunktionen dafür](https://github.com/vuejs/vitepress/issues/96) könnten in Zukunft bereitgestellt werden.

## Markdown

### Bilder

Anders als VuePress verarbeitet VitePress [`base`](./asset-handling#base-url) aus deiner Konfiguration bei der Verwendung statischer Bilder automatisch.

Daher kannst du Bilder jetzt ohne ein `img`-Tag rendern.

```diff
- <img :src="$withBase('/foo.png')" alt="foo">
+ ![foo](/foo.png)
```

::: warning
Für dynamische Bilder benötigst du weiterhin `withBase`, wie in der [Anleitung zur Basis-URL](./asset-handling#base-url) gezeigt.
:::

Verwende den regulären Ausdruck `<img.*withBase\('(.*)'\).*alt="([^"]*)".*>`, um die entsprechenden Stellen zu finden und durch `![$2]($1)` zu ersetzen. So werden alle Bilder in die `![](...)`-Syntax umgewandelt.

---

Weitere Inhalte folgen...
