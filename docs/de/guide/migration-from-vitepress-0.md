# Migration von VitePress 0.x

Wenn du von einer VitePress-0.x-Version kommst, gibt es aufgrund neuer Funktionen und Verbesserungen mehrere Änderungen, die nicht abwärtskompatibel sind. Befolge diese Anleitung, um deine Anwendung auf die aktuelle VitePress-Version zu migrieren.

## App-Konfiguration

- Die Internationalisierungsfunktion ist noch nicht implementiert.

## Theme-Konfiguration

- Die Option `sidebar` hat ihre Struktur geändert.
  - Der Schlüssel `children` heißt jetzt `items`.
  - Ein Element der obersten Ebene darf derzeit kein `link` enthalten. Es ist geplant, dies wieder zu ermöglichen.
- `repo`, `repoLabel`, `docsDir`, `docsBranch`, `editLinks` und `editLinkText` wurden zugunsten einer flexibleren API entfernt.
  - Um einen GitHub-Link mit Symbol zur Navigation hinzuzufügen, verwende die Funktion [Social Links](../reference/default-theme-nav#navigationslinks).
  - Um die Funktion „Diese Seite bearbeiten“ hinzuzufügen, verwende die Funktion [Bearbeitungslink](../reference/default-theme-edit-link).
- Die Option `lastUpdated` ist jetzt in `config.lastUpdated` und `themeConfig.lastUpdated.text` aufgeteilt.
- `carbonAds.carbon` wurde in `carbonAds.code` geändert.

## Frontmatter-Konfiguration

- Die Option `home: true` wurde in `layout: home` geändert. Außerdem wurden viele Einstellungen der Startseite angepasst, um zusätzliche Funktionen bereitzustellen. Weitere Informationen findest du in der [Anleitung zur Startseite](../reference/default-theme-home-page).
- Die Option `footer` wurde nach [`themeConfig.footer`](../reference/default-theme-config#footer) verschoben.
