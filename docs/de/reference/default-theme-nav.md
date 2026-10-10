---
description: Konfiguriere die Navigationsleiste im VitePress-Standard-Theme einschließlich Seitentitel, Logo und Menülinks.
---

# Nav

Die Navigation ist die oben auf der Seite angezeigte Navigationsleiste. Sie enthält den Seitentitel, globale Menülinks usw.

## Seitentitel und Logo

Standardmäßig zeigt die Navigation den Titel der Website anhand des Werts [`config.title`](./site-config#title) an. Wenn du die Anzeige in der Navigation ändern möchtest, kannst du einen eigenen Text über die Option `themeConfig.siteTitle` festlegen.

```js
export default {
  themeConfig: {
    siteTitle: 'My Custom Title'
  }
}
```

Wenn du ein Logo für deine Website hast, kannst du es über den Bildpfad anzeigen. Du solltest das Logo direkt in `public` ablegen und den absoluten Pfad dazu angeben.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

Beim Hinzufügen eines Logos wird es zusammen mit dem Seitentitel angezeigt. Wenn du nur das Logo benötigst und den Seitentitel ausblenden möchtest, setze die Option `siteTitle` auf `false`.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

Du kannst als Logo auch ein Objekt übergeben, wenn du ein `alt`-Attribut hinzufügen oder es abhängig vom Hell-/Dunkelmodus anpassen möchtest. Einzelheiten findest du unter [`themeConfig.logo`](./default-theme-config#logo).

## Navigation Links

Du kannst die Option `themeConfig.nav` definieren, um Links zur Navigation hinzuzufügen.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'Config', link: '/config' },
      { text: 'Changelog', link: 'https://github.com/...' }
    ]
  }
}
```

`text` ist der tatsächlich angezeigte Text in der Navigation, und `link` ist das Ziel, das beim Anklicken des Textes geöffnet wird. Setze beim Link den Pfad zur tatsächlichen Datei ohne `.md` und beginne immer mit `/`.

Der `link` kann auch eine Funktion sein, die [`PageData`](./runtime-api#usedata) als Argument akzeptiert und den Pfad zurückgibt.

Navigationslinks können auch Dropdown-Menüs sein. Setze dazu den Schlüssel `items` in der Link-Option.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      {
        text: 'Dropdown Menu',
        items: [
          { text: 'Item A', link: '/item-1' },
          { text: 'Item B', link: '/item-2' },
          { text: 'Item C', link: '/item-3' }
        ]
      }
    ]
  }
}
```

Beachte, dass der Titel des Dropdown-Menüs (`Dropdown Menu` im obigen Beispiel) keine Eigenschaft `link` besitzen kann, da er zu einer Schaltfläche zum Öffnen des Dropdowns wird.

Du kannst den Dropdown-Menüeinträgen außerdem weitere „Abschnitte“ hinzufügen, indem du weitere verschachtelte Einträge angibst.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // Title for the section.
            text: 'Section A Title',
            items: [
              { text: 'Section A Item A', link: '...' },
              { text: 'Section B Item B', link: '...' }
            ]
          }
        ]
      },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // You may also omit the title.
            items: [
              { text: 'Section A Item A', link: '...' },
              { text: 'Section B Item B', link: '...' }
            ]
          }
        ]
      }
    ]
  }
}
```

### Status des Links "active" state

Navigationseinträge werden hervorgehoben, wenn sich die aktuelle Seite unter dem passenden Pfad befindet. Wenn du den abzugleichenden Pfad anpassen möchtest, definiere die Eigenschaft `activeMatch` als Zeichenkette mit einem regulären Ausdruck.

```js
export default {
  themeConfig: {
    nav: [
      // This link gets active state when the user is
      // on `/config/` path.
      {
        text: 'Guide',
        link: '/guide',
        activeMatch: '/config/'
      }
    ]
  }
}
```

::: warning
`activeMatch` is expected to be a regex string, but you must define it as a string. We can't use actual RegExp object here because it isn't serializable during the build time.
:::

### Status des Links "target" and "rel" attributes

Standardmäßig bestimmt VitePress automatisch `target` and `rel` attributes abhängig davon, ob der Link extern ist. But if you want, you can customize them too.

```js
export default {
  themeConfig: {
    nav: [
      {
        text: 'Merchandise',
        link: 'https://www.thegithubshop.com/',
        target: '_self',
        rel: 'sponsored'
      }
    ]
  }
}
```

## Social Links

Refer [`socialLinks`](./default-theme-config#sociallinks).

## Eigene Komponenten

Du kannst eigene Komponenten mithilfe der Option `component` in die Navigationsleiste aufnehmen. by using the `component` option. The `component` key should be the Vue component name, and must be registered globally using [Theme.enhanceApp](../guide/custom-theme#theme-interface).

```js [.vitepress/config.js]
export default {
  themeConfig: {
    nav: [
      {
        text: 'My Menu',
        items: [
          {
            component: 'MyCustomComponent',
            // Optional props to pass to the component
            props: {
              title: 'My Custom Component'
            }
          }
        ]
      },
      {
        component: 'AnotherCustomComponent'
      }
    ]
  }
}
```

Anschließend musst du die Komponente global registrieren:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

import MyCustomComponent from './components/MyCustomComponent.vue'
import AnotherCustomComponent from './components/AnotherCustomComponent.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MyCustomComponent', MyCustomComponent)
    app.component('AnotherCustomComponent', AnotherCustomComponent)
  }
}
```

Deine Komponente wird in der Navigationsleiste gerendert. VitePress will provide the following additional props to the component:

- `screenMenu`: ein optionaler Boolean, der angibt, ob sich die Komponente im mobilen Navigationsmenü befindet
- `menu`: ein optionaler Boolean, der angibt, ob sich die Komponente in einem Dropdown-Bereich befindet — for example, the `⋯` menu that nav items collapse into when they don't fit the bar. In both these contexts, render a flat list instead of a floating flyout, which would end up nested inside the panel

Du kannst check an example in the e2e tests [here](https://github.com/vuejs/vitepress/tree/main/__tests__/e2e/.vitepress).
