---
outline: deep
description: Verbinde VitePress mit einem Headless-CMS mithilfe dynamischer Routen und Datenlader.
---

# Mit einem CMS verbinden

## Allgemeiner Ablauf

Die Verbindung von VitePress mit einem CMS dreht sich hauptsächlich um [dynamische Routen](./routing#dynamische-routen). Stelle sicher, dass du verstanden hast, wie sie funktionieren, bevor du fortfährst.

Da jedes CMS anders funktioniert, können wir hier nur einen allgemeinen Ablauf beschreiben, den du an dein konkretes Szenario anpassen musst.

1. Wenn dein CMS eine Authentifizierung erfordert, erstelle eine `.env`-Datei zum Speichern deiner API-Tokens und lade sie:

    ```js
    // posts/[id].paths.js
    import { loadEnv } from 'vitepress'

    const env = loadEnv('', process.cwd())
    ```

2. Rufe die benötigten Daten aus dem CMS ab und formatiere sie als gültige Pfaddaten:

    ```js
    export default {
      async paths() {
        // Verwende bei Bedarf die Client-Bibliothek des jeweiligen CMS.
        const data = await (await fetch('https://my-cms-api', {
          headers: {
            // Token, falls erforderlich.
          }
        })).json()

        return data.map(entry => {
          return {
            params: { id: entry.id, /* title, authors, date etc. */ },
            content: entry.content
          }
        })
      }
    }
    ```

3. Rendere den Inhalt auf der Seite:

    ```md
    # {{ $params.title }}

    - von {{ $params.author }} am {{ $params.date }}

    <!-- @content -->
    ```

## Integrationsanleitungen

Wenn du eine Anleitung zur Integration von VitePress in ein bestimmtes CMS geschrieben hast, verwende bitte den Link „Diese Seite bearbeiten“ unten auf der Seite, um sie hier einzureichen.
