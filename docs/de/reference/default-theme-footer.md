---
description: Konfiguriere die globale Fußzeile, die am unteren Rand von VitePress-Seiten angezeigt wird.
---

# Fußzeile

VitePress zeigt eine globale Fußzeile am unteren Rand der Seite an, wenn `themeConfig.footer` vorhanden ist.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    }
  }
}
```

```ts
export interface Fußzeile {
  // The message shown right before copyright.
  message?: string

  // The actual copyright text.
  copyright?: string
}
```

Die obige Konfiguration unterstützt außerdem HTML-Zeichenketten. Wenn du beispielsweise Links in der Fußzeile anzeigen möchtest, kannst du die Konfiguration wie folgt anpassen:

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Released under the <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">MIT License</a>.',
      copyright: 'Copyright © 2019-present <a href="https://github.com/yyx990803">Evan You</a>'
    }
  }
}
```

::: warning
In `message` und `copyright` können nur Inline-Elemente verwendet werden, da sie innerhalb eines `<p>`-Elements gerendert werden. Wenn du want to add block elements, consider using [`layout-bottom`](../guide/extending-Standard-theme#layout-slots) slot instead.
:::

Hinweis that footer will not be displayed when the [SideBar](./Standard-theme-sidebar) is visible.

## Frontmatter-Konfiguration

Dies can be deaktiviert per-page using the `footer` option on frontmatter:

```yaml
---
footer: false
---
```
