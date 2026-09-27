---
description: Wähle zwischen den Layouts doc, page und home im VitePress-Standard-Theme.
---

# Layout

Du kannst das Seitenlayout auswählen, indem du die Option `layout` im [Frontmatter](./frontmatter-config) der Seite setzt. Es gibt drei Layoutoptionen: `doc`, `page` und `home`. Wenn nichts angegeben ist, wird die Seite als `doc`-Seite behandelt.

```yaml
---
layout: doc
---
```

## Doc Layout

Die Option `doc` ist das Standardlayout. Sie gestaltet den gesamten Markdown-Inhalt im Stil einer „Dokumentation“, indem der gesamte Inhalt in die CSS-Klasse `vp-doc` eingeschlossen und auf die darin enthaltenen Elemente entsprechende Stile angewendet werden.

Nahezu alle allgemeinen Elemente wie `p` oder `h2` erhalten eine spezielle Gestaltung. Beachte daher, dass auch benutzerdefiniertes HTML innerhalb eines Markdown-Inhalts von diesen Stilen betroffen ist.

Außerdem stellt dieses Layout die unten aufgeführten dokumentationsspezifischen Funktionen bereit. Diese Funktionen sind nur in diesem Layout aktiviert.

- Bearbeitungslink
- Prev Weiter Link
- Outline
- [Carbon Ads](./default-theme-carbon-ads)

## Seite Layout

Die Option `page` wird als „leere Seite“ behandelt. Das Markdown wird weiterhin analysiert und alle [Markdown-Erweiterungen](../guide/markdown) funktionieren wie beim `doc`-Layout, erhalten jedoch keine Standardgestaltung.

Mit dem Seitenlayout kannst du alles selbst gestalten, ohne dass das VitePress-Theme das Markup beeinflusst. Das ist nützlich, wenn du eine eigene Seite erstellen möchtest.

Beachte, dass auch in diesem Layout die Seitenleiste angezeigt wird, wenn für die Seite eine passende Seitenleistenkonfiguration vorhanden ist.

## Home Layout

Die Option `home` erzeugt eine vorgefertigte „Startseite“. In diesem Layout kannst du zusätzliche Optionen wie `hero` und `features` festlegen, um den Inhalt weiter anzupassen. Weitere Informationen findest du unter [Standard-Theme: Startseite](./default-theme-home-page).

## No Layout

Wenn du kein Layout möchtest, kannst du über das Frontmatter `layout: false` angeben. Diese Option ist hilfreich, wenn du eine vollständig anpassbare Einstiegsseite ohne standardmäßige Seitenleiste, Navigationsleiste oder Fußzeile erstellen möchtest.

## Eigenes Layout

Du kannst auch ein eigenes Layout verwenden:

```md
---
layout: foo
---
```

Dadurch wird nach einer im Kontext registrierten Komponente namens `foo` gesucht. Zum Beispiel kannst du deine Komponente global in `.vitepress/theme/index.ts` registrieren:

```ts
import DefaultTheme from 'vitepress/theme'
import Foo from './Foo.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('foo', Foo)
  }
}
```
