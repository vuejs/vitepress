---
outline: deep
description: Sicherstellen, dass deine VitePress-Theme-Komponenten und dein eigener Code mit serverseitigem Rendering kompatibel sind.
---

# SSR-Kompatibilität

VitePress rendert die Anwendung während des Produktions-Builds in Node.js vor und verwendet dabei die Server-Side-Rendering-Funktionen (SSR) von Vue. Das bedeutet, dass eigener Code in Theme-Komponenten SSR-kompatibel sein muss.

Der [SSR-Abschnitt in der offiziellen Vue-Dokumentation](https://vuejs.org/guide/scaling-up/ssr.html) bietet weitere Informationen zu SSR, zum Verhältnis zwischen SSR und SSG sowie zu wichtigen Hinweisen für SSR-kompatiblen Code. Als Faustregel gilt, dass Browser-/DOM-APIs nur in `beforeMount`- oder `mounted`-Hooks von Vue-Komponenten verwendet werden sollten.

## `<ClientOnly>`

Wenn du nicht SSR-kompatible Komponenten verwendest oder demonstrierst (beispielsweise solche mit eigenen Direktiven), kannst du sie in die integrierte `<ClientOnly>`-Komponente einschließen:

```md
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

## Bibliotheken, die beim Import auf Browser-APIs zugreifen

Einige Komponenten oder Bibliotheken greifen **beim Import** auf Browser-APIs zu. Um Code zu verwenden, der beim Import eine Browserumgebung voraussetzt, musst du ihn dynamisch importieren.

### Import in einem Mounted-Hook

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  import('./lib-that-access-window-on-import').then((module) => {
    // use code
  })
})
</script>
```

### Bedingter Import

Du kannst eine Abhängigkeit auch bedingt mithilfe des Flags `import.meta.env.SSR` importieren, das zu den [Vite-Umgebungsvariablen](https://vite.dev/guide/env-and-mode.html#env-variables) gehört:

```js
if (!import.meta.env.SSR) {
  import('./lib-that-access-window-on-import').then((module) => {
    // use code
  })
}
```

Da [`Theme.enhanceApp`](./custom-theme#theme-interface) asynchron sein kann, kannst du Vue-Plugins, die beim Import auf Browser-APIs zugreifen, bedingt importieren und registrieren:

```js [.vitepress/theme/index.js]
/** @type {import('vitepress').Theme} */
export default {
  // ...
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-that-access-window-on-import')
      app.use(plugin.default)
    }
  }
}
```

Wenn du're Verwendung TypeScript:
```ts [.vitepress/theme/index.ts]
import type { Theme } from 'vitepress'

export default {
  // ...
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-that-access-window-on-import')
      app.use(plugin.default)
    }
  }
} satisfies Theme
```

### `defineClientComponent`

VitePress stellt einen praktischen Helper zum Importieren von Vue-Komponenten bereit, die beim Import auf Browser-APIs zugreifen.

```vue
<script setup>
import { defineClientComponent } from 'vitepress'

const ClientComp = defineClientComponent(() => {
  return import('component-that-access-window-on-import')
})
</script>

<template>
  <ClientComp />
</template>
```

Du kannst der Zielkomponente auch Props, Children und Slots übergeben:

```vue
<script setup>
import { ref } from 'vue'
import { defineClientComponent } from 'vitepress'

const clientCompRef = ref(null)
const ClientComp = defineClientComponent(
  () => import('component-that-access-window-on-import'),

  // args are passed to h() - https://vuejs.org/api/render-function.html#h
  [
    {
      ref: clientCompRef
    },
    {
      default: () => 'default slot',
      foo: () => h('div', 'foo'),
      bar: () => [h('span', 'one'), h('span', 'two')]
    }
  ],

  // callback after the component is loaded, can be async
  () => {
    console.log(clientCompRef.value)
  }
)
</script>

<template>
  <ClientComp />
</template>
```

Die Zielkomponente wird erst im `mounted`-Hook der Wrapper-Komponente importiert.
