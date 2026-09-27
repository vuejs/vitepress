---
description: Zeige den Zeitpunkt der letzten Aktualisierung von VitePress-Seiten anhand der Git-Commit-Historie an.
---

# Letzte Aktualisierung

Der Aktualisierungszeitpunkt des letzten Inhalts wird unten rechts auf der Seite angezeigt. Füge zum Aktivieren die Option `lastUpdated` zu deiner Konfiguration hinzu.

::: info
VitePress zeigt den Zeitpunkt der letzten Aktualisierung anhand des Zeitstempels des neuesten Git-Commits für jede Datei an. Dafür muss die Markdown-Datei in Git committed sein.

Intern führt VitePress für jede Datei `git log -1 --pretty="%ai"` aus, um den Zeitstempel abzurufen. Wenn alle Seiten dieselbe Aktualisierungszeit anzeigen, liegt dies wahrscheinlich an einem flachen Klonen (häufig in CI-Umgebungen), das den Git-Verlauf begrenzt.

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

Dies kann pro Seite über die `lastUpdated`-Option im Frontmatter deaktiviert werden:

```yaml
---
lastUpdated: false
---
```

Weitere Informationen findest du unter [Standard-Theme: Letzte Aktualisierung](./Standard-theme-config#lastupdated). Jeder als wahr ausgewertete Wert auf Theme-Ebene aktiviert die Funktion ebenfalls, sofern sie nicht ausdrücklich auf Website- oder Seitenebene deaktiviert wird.
