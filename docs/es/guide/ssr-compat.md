---
outline: deep
---

# Compatibilidad SSR {#ssr-compatibility}

VitePress pre-interpreta la aplicación en Node.js durante la compilación del producción, utilizando las capacidades de Interpretación del lado del servidor (SSR) de Vue. Esto significa que todo el código personalizado en los componentes del tema está sujeto a la compatibilidad SSR.

La [sección SSR en la documentación Vue oficial](https://vuejs.org/guide/scaling-up/ssr.html) proporciona más contexto sobre lo que es SSR, la relación entre SSR / SSG y notas comunes sobre escribir código amigable con SSR. La regla general es acceder apenas APIs deln navegador / DOM en los hooks `beforeMount` o `mounted` de los componentes Vue.

## `<ClientOnly>`

Se está usando o demostrando componentes que no son compatibles con SSR (por ejemplo, contienen directivas personalizadas), puede envolverlos en el componente embutido `<ClientOnly>`:

```md
<ClientOnly>
  <ComponenteNoCompatibleConSSR />
</ClientOnly>
```

## Bibliotecas que Acceden el API del Navegador en la Importación {#libraries-that-access-browser-api-on-import}

Algunos componentes o bibliotecas acceden APIs del navegador **en la Importación**. Para usar código que asume un ambiente de navegador en la importación, necesita importarlo dinámicamente.

### Importando en el Hook `mounted` {#importing-in-mounted-hook}

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  import('./lib-que-accede-window-en-la-importacion').then((module) => {
    // usar código
  })
})
</script>
```

### Importación Condicional {#conditional-import}

Puede también importar condicionalmente usando el flag `import.meta.env.SSR` (parte de las [variables de entorno Vite](https://vitejs.dev/guide/env-and-mode.html#env-variables)):

```js
if (!import.meta.env.SSR) {
  import('./lib-que-accede-window-en-la-importacion').then((module) => {
    // usar código
  })
}
```

Como [`Theme.enhanceApp`](./custom-theme#theme-interface) puede ser asíncrono, puede importar condicionalmente y registrar plugins Vue que acceden APIs del navegador en la importación:

```js [.vitepress/theme/index.js]
/** @type {import('vitepress').Theme} */
export default {
  // ...
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-que-accede-window-en-la-importacion')
      app.use(plugin.default)
    }
  }
}
```

Si está usando TypeScript:
```ts [.vitepress/theme/index.ts]
import type { Theme } from 'vitepress'

export default {
  // ...
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-que-accede-window-en-la-importacion')
      app.use(plugin.default)
    }
  }
} satisfies Theme
```

### `defineClientComponent`

VitePress proporciona un auxiliar de conveniencia para importar componentes Vue que acceden APIs del navegador en la importación.

```vue
<script setup>
import { defineClientComponent } from 'vitepress'

const ClientComp = defineClientComponent(() => {
  return import('componente-que-accede-window-en-la-importacion')
})
</script>

<template>
  <ClientComp />
</template>
```

Puede también pasar propiedades/hijos/_slots_ para el componente objetivo:

```vue
<script setup>
import { ref } from 'vue'
import { defineClientComponent } from 'vitepress'

const clientCompRef = ref(null)
const ClientComp = defineClientComponent(
  () => import('componente-que-acessa-window-na-importacao'),

  // los argumentos son pasados para h() - https://vuejs.org/api/render-function.html#h
  [
    {
      ref: clientCompRef
    },
    {
      default: () => 'slot por defecto',
      foo: () => h('div', 'foo'),
      bar: () => [h('span', 'uno'), h('span', 'dos')]
    }
  ],

  // callback después de que el componente es cargado, puede ser asíncrono

  () => {
    console.log(clientCompRef.value)
  }
)
</script>

<template>
  <ClientComp />
</template>
```

El componente objetivo solo será importado en el hook `mounted` del componente que lo envuelve.
