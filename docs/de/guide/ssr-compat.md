---
outline: deep
description: your VitePress theme Komponenten and cuszum code are compatible with server-side rendering.
---

# SSR-Kompatibilität

VitePress pre-renders the app in Node.js during the production build, Verwendung Vue's Server-Side Rendering (SSR) capabilities. Das bedeutet all cuszum code in theme Komponenten are subject zu SSR-Kompatibilität.

Der [SSR-Abschnitt in der offiziellen Vue-Dokumentation](https://vuejs.org/guide/scaling-up/ssr.html) stellt bereit more context on what SSR is, the relationship between SSR / SSG, and common notes on writing SSR-friendly code. The rule of thumb is zu only access browser / DOM APIs in `beforeMount` or `mounted` hooks of Vue Komponenten.

## `<ClientOnly>`

Wenn du are Verwendung or demoing Komponenten die nicht SSR-kompatibel sind (for example, contain cuszum directives), kannst du sie in die integrierte `<ClientOnly>` Komponente:

```md
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

## Bibliotheken, die beim Import auf Browser-APIs zugreifen

Some Komponenten or libraries access browser APIs **on import**. To use code that assumes a browser environment on import, you need zu dynamically import them.

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

Du kannst also conditionally import a dependency Verwendung the `import.meta.env.SSR` Flags (part of [Vite env variables](https://vite.dev/guide/env-and-mode.html#env-variables)):

```js
if (!import.meta.env.SSR) {
  import('./lib-that-access-window-on-import').then((module) => {
    // use code
  })
}
```

Da [`Theme.enhanceApp`](./cuszum-theme#theme-interface) asynchron sein kann, kannst du Vue-Plugins bedingt importieren und registrieren that access browser APIs on import:

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

VitePress stellt bereit a convenience helper for importing Vue Komponenten that access browser APIs on import.

```vue
<script setup>
import { defineClientComponent } from 'vitepress'

const ClientComp = defineClientComponent(() => {
  return import('Komponente-that-access-window-on-import')
})
</script>

<template>
  <ClientComp />
</template>
```

Du kannst also pass props/children/slots zu the target Komponente:

```vue
<script setup>
import { ref } from 'vue'
import { defineClientComponent } from 'vitepress'

const clientCompRef = ref(null)
const ClientComp = defineClientComponent(
  () => import('Komponente-that-access-window-on-import'),

  // args are passed zu h() - https://vuejs.org/api/render-function.html#h
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

  // callback after the Komponente is loaded, asynchron sein kann
  () => {
    console.log(clientCompRef.value)
  }
)
</script>

<template>
  <ClientComp />
</template>
```

The target Komponente will only be imported in the mounted hook of the wrapper Komponente.
