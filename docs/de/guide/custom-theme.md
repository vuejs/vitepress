---
description: Erstelle und verwende ein eigenes Theme in VitePress, um das Erscheinungsbild und Verhalten deiner Website vollständig zu steuern.
---

# Ein eigenes Theme verwenden

## Theme-Auflösung

Du kannst ein eigenes Theme aktivieren, indem du eine Datei `.vitepress/theme/index.js` oder `.vitepress/theme/index.ts` (die „Theme-Einstiegsdatei“) erstellst:

```
.
├─ docs                # Projektstammverzeichnis
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.js   # Theme-Einstiegsdatei
│  │  └─ config.js     # Konfigurationsdatei
│  └─ index.md
└─ package.json
```

VitePress verwendet immer das eigene Theme anstelle des Standard-Themes, sobald es eine Theme-Einstiegsdatei erkennt. Du kannst jedoch [das Standard-Theme erweitern](./extending-default-theme), um darauf aufbauend fortgeschrittene Anpassungen vorzunehmen.

## Theme-Schnittstelle

Ein eigenes VitePress-Theme wird als Objekt mit der folgenden Schnittstelle definiert:

```ts
interface Theme {
  /**
   * Stamm-Layout-Komponente für jede Seite
   * @required
   */
  Layout: Component
  /**
   * Vue-App-Instanz erweitern
   * @optional
   */
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  /**
   * Wird innerhalb von `setup()` der Stammkomponente ausgeführt
   * @optional
   */
  setup?: () => void
  /**
   * Ein anderes Theme erweitern und dessen `enhanceApp` und `setup` vor unserem aufrufen
   * @optional
   */
  extends?: Theme
}

interface EnhanceAppContext {
  app: App // Vue-App-Instanz
  router: Router // VitePress-Router-Instanz
  siteData: Ref<SiteData> // Metadaten auf Website-Ebene
}
```

Die Theme-Einstiegsdatei sollte das Theme als Standardexport exportieren:

```js [.vitepress/theme/index.js]

// Vue-Dateien können direkt in der Theme-Einstiegsdatei importiert werden
// VitePress ist bereits mit @vitejs/plugin-vue vorkonfiguriert.
import Layout from './Layout.vue'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // app.component(...)
    // app.use(...)
  }
}
```

Der `enhanceApp`-Hook ermöglicht den Zugriff auf die [Vue-App-Instanz](https://vuejs.org/api/application.html) und andere Laufzeitdaten. Damit kannst du beispielsweise [globale Komponenten registrieren](./extending-default-theme.md#registering-global-components), Vue-Bibliotheken integrieren usw.

Der Wert `router` ist dieselbe VitePress-Router-Instanz, die von [`useRouter()`](../reference/runtime-api#userouter). Um auf Routenänderungen zu reagieren, weist du dem Router Handler zu:

```ts [.vitepress/theme/index.ts]
export default {
  enhanceApp({ router }) {
    router.onBeforeRouteChange = (to) => {
      console.log('navigiere zu', to)
    }

    router.onAfterRouteChange = (to) => {
      console.log('weitergeleitet zu', to)
    }
  }
}
```

Gib von `onBeforeRouteChange` or `onBeforePageLoad` `false` zurück, um die Navigation abzubrechen.

Der `setup`-Hook wird innerhalb von `setup()` der Stammkomponente ausgeführt. Deshalb funktionieren Aufrufe der Composition API (`onMounted`, `watch`, composables, ...) dort ohne dass du die Layout-Komponente umschließen musst:

```ts [.vitepress/theme/index.ts]
import { watch } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  setup() {
    const { page } = useData()
    watch(() => page.value.relativePath, (path) => {
      console.log('now viewing', path)
    })
  }
}
```

Mit `extends` wird das `setup` jedes Themes wie bei `enhanceApp` von der Basis ausgehend ausgeführt. Es läuft außerdem während des SSR-/SSG-Renderings. Browser-spezifische Arbeit sollte daher innerhalb von `onMounted` bleiben.

Der Standardexport ist der einzige Vertrag für ein eigenes Theme, und nur die Eigenschaft `Layout` ist erforderlich. Technisch kann ein VitePress-Theme daher aus nur einer einzigen Vue-Komponente bestehen.

Innerhalb deiner Layout-Komponente funktioniert alles wie in einer normalen Vite- + Vue-3-Anwendung. Beachte, dass das Theme außerdem [mit SSR kompatibel](./ssr-compat) sein muss.

## Ein Layout erstellen

Die einfachste Layout-Komponente muss eine [`<Content />`](../reference/runtime-api#content) -Komponente enthalten:

```vue [.vitepress/theme/Layout.vue]
<template>
  <h1>Eigenes Layout!</h1>

  <!-- Hier wird der Markdown-Inhalt gerendert -->
  <Content />
</template>
```

Das obige Layout rendert den Markdown-Inhalt jeder Seite einfach als HTML. Als erste Verbesserung können wir die Behandlung von 404-Fehlern hinzufügen:

```vue{1-4,9-12}
<script setup>
import { useData } from 'vitepress'
const { page } = useData()
</script>

<template>
  <h1>Eigenes Layout!</h1>

  <div v-if="page.isNotFound">
    Eigene 404-Seite!
  </div>
  <Content v-else />
</template>
```

Der [`useData()`](../reference/runtime-api#usedata)-Helper stellt uns alle Laufzeitdaten zur Verfügung, die wir benötigen, um verschiedene Layouts bedingt zu rendern. Zu den Daten, auf die wir zugreifen können, gehört das Frontmatter der aktuellen Seite. Damit können wir dem Endbenutzer ermöglichen, das Layout jeder Seite zu steuern. Zum Beispiel kann der Benutzer angeben, dass die Seite ein spezielles Startseitenlayout verwenden soll:

```md
---
layout: home
---
```

Anschließend können wir unser Theme entsprechend anpassen:

```vue{3,12-14}
<script setup>
import { useData } from 'vitepress'
const { page, frontmatter } = useData()
</script>

<template>
  <h1>Eigenes Layout!</h1>

  <div v-if="page.isNotFound">
    Eigene 404-Seite!
  </div>
  <div v-if="frontmatter.layout === 'home'">
    Eigene Startseite!
  </div>
  <Content v-else />
</template>
```

Natürlich kannst du das Layout auch auf mehrere Komponenten aufteilen:

```vue{3-5,12-15}
<script setup>
import { useData } from 'vitepress'
import NotFound from './NotFound.vue'
import Home from './Home.vue'
import Page from './Page.vue'

const { page, frontmatter } = useData()
</script>

<template>
  <h1>Eigenes Layout!</h1>

  <NotFound v-if="page.isNotFound" />
  <Home v-if="frontmatter.layout === 'home'" />
  <Page v-else /> <!-- <Page /> renders <Content /> -->
</template>
```

In der [Runtime API Referenz](../reference/runtime-api) findest du alles, was in Theme-Komponenten verfügbar ist. Zusätzlich kannst du [Build-Time Data Loading](./data-loading) nutzen, um datenbasierte Layouts zu erzeugen – beispielsweise eine Seite, die alle Blogbeiträge des aktuellen Projekts auflistet.

## Ein eigenes Theme verteilen

Am einfachsten verteilst du ein eigenes Theme, indem du es als [template repository on GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository).

Wenn du das Theme als npm-Paket verteilen möchtest, gehe folgendermaßen vor:

1. Exportiere das Theme-Objekt als Standardexport des Paketeintrags.

2. Falls zutreffend, exportiere die Typdefinition deiner Theme-Konfiguration als `ThemeConfig`.

3. Wenn dein Theme Anpassungen an der VitePress-Konfiguration erfordert, exportiere diese Konfiguration unter einem Paket-Unterpfad (e.g. `my-theme/config`) damit Benutzer sie erweitern können.

4. Dokumentiere die Optionen der Theme-Konfiguration sowohl über die Konfigurationsdatei als auch über Frontmatter.

5. Stelle klare Anweisungen zur Verwendung deines Themes bereit (siehe unten).

## Ein eigenes Theme verwenden

Um ein externes Theme zu verwenden, importiere und exportiere es aus der Theme-Einstiegsdatei erneut:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default Theme
```

Wenn das Theme erweitert werden muss:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default {
  extends: Theme,
  enhanceApp(ctx) {
    // ...
  }
}
```

Wenn das Theme eine spezielle VitePress-Konfiguration benötigt, musst du sie auch in deiner eigenen Konfiguration erweitern:

```ts [.vitepress/config.ts]
import baseConfig from 'awesome-vitepress-theme/config'

export default {
  // Basis-Konfiguration des Themes erweitern (falls erforderlich)
  extends: baseConfig
}
```

Wenn das Theme schließlich Typen für seine Theme-Konfiguration bereitstellt:

```ts [.vitepress/config.ts]
import baseConfig from 'awesome-vitepress-theme/config'
import { defineConfig } from 'vitepress'
import type { ThemeConfig } from 'awesome-vitepress-theme'

export default defineConfig<ThemeConfig>({
  extends: baseConfig,
  themeConfig: {
    // Typ ist `ThemeConfig`
  }
})
```
