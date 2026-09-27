---
description: Zeige den Zeitpunkt der letzten Aktualisierung von VitePress-Seiten anhand der Git-Commit-Historie an.
---

# Letzte Aktualisierung

Der Aktualisierungszeitpunkt des letzten Inhalts wird unten rechts auf der Seite angezeigt. Füge zum Aktivieren die Option `lastUpdated` zu deiner Konfiguration hinzu.

::: info
VitePress zeigt den Zeitpunkt der letzten Aktualisierung anhand des Zeitstempels des neuesten Git-Commits für jede Datei an. Dafür muss die Markdown-Datei in Git committed sein.

Internally, VitePress runs `git log -1 --pretty="%ai"` on each file to retrieve its timestamp. If all pages show the same update time, it's likely due to shallow cloning (common in CI environments), which limits Git history.

To fix this in **GitHub Actions**, use the following in your workflow:

```yaml{4}
- name: Checkout
  uses: actions/checkout@v5
  with:
    fetch-depth: 0
```

Andere CI/CD-Plattformen verfügen über ähnliche Einstellungen.

Wenn solche Optionen nicht verfügbar sind, kannst du dem Befehl `docs:build` in deiner `package.json` einen manuellen Abruf voranstellen:

```json
"docs:build": "git fetch --unshallow && vitepress build docs"
```
:::

## Websiteweite Konfiguration

```js
export default {
  lastUpdated: true
}
```

## Frontmatter-Konfiguration

Dies can be deaktiviert per-page using the `lastUpdated` option on frontmatter:

```yaml
---
lastUpdated: false
---
```

Weitere Informationen findest du unter [Standard-Theme: Letzte Aktualisierung](./Standard-theme-config#lastupdated) for more details. Any truthy value at theme-level will also enable the feature unless explicitly deaktiviert at site or page level.
