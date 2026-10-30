---
description: Zeige auf Dokumentationsseiten einen Bearbeitungslink an, über den Nutzer Änderungen auf GitHub oder GitLab vorschlagen können.
---

# Bearbeitungslink

## Websiteweite Konfiguration

Mit dem Bearbeitungslink kannst du einen Link zum Bearbeiten der Seite bei Git-Verwaltungsdiensten wie GitHub oder GitLab anzeigen. Füge zum Aktivieren die Optionen von `themeConfig.editLink` zu deiner Konfiguration hinzu.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

Die Option `pattern` definiert die URL-Struktur des Links. `:path` wird durch den Seitenpfad ersetzt.

Du kannst auch eine reine Funktion angeben, die [`PageData`](./runtime-api#usedata) als Argument akzeptiert und die URL als Zeichenkette zurückgibt.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: ({ filePath }) => {
        if (filePath.startsWith('packages/')) {
          return `https://github.com/acme/monorepo/edit/main/${filePath}`
        } else {
          return `https://github.com/acme/monorepo/edit/main/docs/${filePath}`
        }
      }
    }
  }
}
```

Die Funktion sollte keine Seiteneffekte haben und nicht auf Dinge außerhalb ihres Gültigkeitsbereichs zugreifen, da sie serialisiert und im Browser ausgeführt wird.

Standardmäßig wird am unteren Rand der Dokumentationsseite der Linktext „Diese Seite bearbeiten“ hinzugefügt. Du kannst diesen Text über die Option `text` anpassen.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Diese Seite auf GitHub bearbeiten'
    }
  }
}
```

## Frontmatter-Konfiguration

Dies kann pro Seite über die Option `editLink` im Frontmatter deaktiviert werden:

```yaml
---
editLink: false
---
```
