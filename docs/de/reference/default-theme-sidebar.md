---
description: Konfiguriere die Seitenleistennavigation im VitePress-Standard-Theme mit Gruppen, einklappbaren Abschnitten und mehreren Seitenleisten.
---

# Seitenleiste

Die Seitenleiste ist der zentrale Navigationsbereich deiner Dokumentation. Du kannst das Seitenleistenmenü konfigurieren in [`themeConfig.sidebar`](./default-theme-config#sidebar).

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Getting Started', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

## Grundlagen

Die einfachste Form des Seitenleistenmenüs besteht aus einem einzelnen Array von Links. Das Element der ersten Ebene definiert den „Abschnitt“ der Seitenleiste. Es sollte `text`, den Titel des Abschnitts, und `items`, die eigentlichen Navigationslinks, enthalten.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        items: [
          { text: 'Item A', link: '/item-a' },
          { text: 'Item B', link: '/item-b' },
          ...
        ]
      },
      {
        text: 'Section Title B',
        items: [
          { text: 'Item C', link: '/item-c' },
          { text: 'Item D', link: '/item-d' },
          ...
        ]
      }
    ]
  }
}
```

Jeder `link` sollte den Pfad zur tatsächlichen Datei angeben und mit `/` beginnen. Wenn du am Ende des Links einen abschließenden Schrägstrich hinzufügst, wird `index.md` des entsprechenden Verzeichnisses angezeigt.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          // This shows `/guide/index.md` page.
          { text: 'Introduction', link: '/guide/' }
        ]
      }
    ]
  }
}
```

Du kannst die Seitenleisteneinträge bis zu sechs Ebenen tief verschachteln, ausgehend von der obersten Ebene. Beachte, dass Verschachtelungen mit mehr als sechs Ebenen ignoriert und nicht in der Seitenleiste angezeigt werden.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Level 1',
        items: [
          {
            text: 'Level 2',
            items: [
              {
                text: 'Level 3',
                items: [
                  ...
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## Multiple Sidebars

Du kannst abhängig vom Seitenpfad unterschiedliche Seitenleisten anzeigen. Zum Beispiel möchtest du in deiner Dokumentation möglicherweise separate Inhaltsbereiche wie eine „Anleitung“-Seite und eine „Konfiguration“-Seite erstellen.

Ordne dazu zunächst deine Seiten in Verzeichnissen für die gewünschten Abschnitte an:

```
.
├─ guide/
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ config/
   ├─ index.md
   ├─ three.md
   └─ four.md
```

Then, update your configuration to define your sidebar for each section. This time, you should pass an object instead of an array.

```js
export default {
  themeConfig: {
    sidebar: {
      // This sidebar gets displayed when a user
      // is on `guide` directory.
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Index', link: '/guide/' },
            { text: 'One', link: '/guide/one' },
            { text: 'Two', link: '/guide/two' }
          ]
        }
      ],

      // This sidebar gets displayed when a user
      // is on `config` directory.
      '/config/': [
        {
          text: 'Config',
          items: [
            { text: 'Index', link: '/config/' },
            { text: 'Three', link: '/config/three' },
            { text: 'Four', link: '/config/four' }
          ]
        }
      ]
    }
  }
}
```

## Collapsible Seitenleiste Groups

By adding `collapsed` option to the sidebar group, it shows a toggle button to hide/show each section.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        collapsed: false,
        items: [...]
      }
    ]
  }
}
```

All sections are "open" by default. Wenn du would like them to be "closed" on initial page load, set `collapsed` option to `true`.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        collapsed: true,
        items: [...]
      }
    ]
  }
}
```

## Path Prefix

When your documentation structure has deep directories or groups located under the same subdirectory, you can use the `base` option to automatisch prepend a path prefix to all nested `items` inside that group. This avoids repeating the same path prefix for every `link`.

The `base` option is supported in both multiple sidebar configurations and nested sidebar groups.

### In Multiple Sidebars

Du kannst define `base` at the root of a sidebar section configuration:

```js {5}
export default {
  themeConfig: {
    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          // This link is resolved to `/guide/introduction`
          { text: 'Introduction', link: 'introduction' },
          // This link is resolved to `/guide/getting-started`
          { text: 'Getting Started', link: 'getting-started' }
        ]
      }
    }
  }
}
```

### In Nested Groups

Du kannst also use `base` inside nested sidebar groups. It will apply to the immediate children of that group:

```js{6,13}
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Reference',
        base: '/reference/',
        items: [
          // This link is resolved to `/reference/site-config`
          { text: 'Site-Konfiguration', link: 'site-config' },
          {
            text: 'Standard-Theme',
            // Nested base overrides the parent path prefix
            base: '/reference/default-theme-',
            items: [
              // This link is resolved to `/reference/default-theme-nav`
              { text: 'Nav', link: 'nav' },
              // This link is resolved to `/reference/default-theme-sidebar`
              { text: 'Seitenleiste', link: 'sidebar' }
            ]
          }
        ]
      }
    ]
  }
}
```
