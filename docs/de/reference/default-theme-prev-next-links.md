---
description: Passe die am unteren Rand von Dokumentationsseiten in VitePress angezeigten Links zur vorherigen und nächsten Seite an.
---

# Prev Weiter Links

Du kannst Text und Link für die vorherige und nächste Seite anpassen (sie werden am Ende der Dokumentationsseite angezeigt). Das ist hilfreich, wenn du dort einen anderen Text als in deiner Seitenleiste verwenden möchtest. Außerdem kann es nützlich sein, die Fußzeile zu deaktivieren oder auf eine Seite zu verlinken, die nicht in deiner Seitenleiste enthalten ist.

## prev

- Type: `string | false | { text?: string; link?: string }`

- Details:

  Legt den Text/Link fest, der für den Link zur vorherigen Seite angezeigt wird. Wenn du dies im Frontmatter nicht festlegst, werden Text und Link aus der Seitenleistenkonfiguration abgeleitet.

- Beispiele:

  - To customize only the text:

    ```yaml
    ---
    prev: 'Get Started | Markdown'
    ---
    ```

  - To customize both text and link:

    ```yaml
    ---
    prev:
      text: 'Markdown'
      link: '/guide/markdown'
    ---
    ```

  - To hide previous page:

    ```yaml
    ---
    prev: false
    ---
    ```

## next

Wie `prev`, aber für die nächste Seite.
