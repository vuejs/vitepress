---
outline: deep
---

# Compatibilidad SSR {#ssr-compatibility}

VitePress pre-renderiza la aplicación en Node.js durante la compilación de producción, utilizando las capacidades de Renderizado del Lado del Servidor (SSR) de Vue. Esto significa que todo el código personalizado en los componentes del tema está sujeto a la Compatibilidad con SSR.

La [sección SSR en la documentación Vue oficial](https://vuejs.org/guide/scaling-up/ssr.html) proporciona más contexto sobre lo que es SSR, la relación entre SSR / SSG y notas comunes sobre escribir código amigable para SSR. La regla general es acceder a las APIs del navegador / DOM solo en los hooks `beforeMount` o `mounted` de los componentes de Vue.

## `<ClientOnly>`

Si está usando o demostrando componentes que no son compatibles con SSR (por ejemplo, contienen directivas personalizadas), puede envolverlos en el componente incorporado `<ClientOnly>`:

```md
<ClientOnly>
  <ComponenteNoCompatibleConSSR />
</ClientOnly>
```

## Bibliotecas que Acceden el API del Navegador en la Importación {#libraries-that-access-browser-api-on-import}

Algunos componentes o librerías acceden a las APIs del navegador **al momento de ser importados**. Para usar código que asume un entorno de navegador en la importación, necesita importarlos dinámicamente.

### Importando en el Hook `mounted` {#importing-in-mounted-hook}

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  import('./lib-que-accede-a-window-en-la-importacion').then((module) => {
    // usar código
  })
})
</script>
```

### Importación Condicional {#conditional-import}

También puede importar una dependencia condicionalmente utilizando la bandera `import.meta.env.SSR` (que forma parte de las [variables de entorno Vite](https://vitejs.dev/guide/env-and-mode.html#env-variables)):

```js
if (!import.meta.env.SSR) {
  import('./lib-que-accede-a-window-en-la-importacion').then((module) => {
    // usar código
  })
}
```

Dado que [`Theme.enhanceApp`](./custom-theme#theme-interface) puede ser asíncrono, puede importar y registrar condicionalmente plugins de Vue que accedan a las APIs del navegador al ser importados:

```js [.vitepress/theme/index.js]
/** @type {import('vitepress').Theme} */
export default {
  // ...
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-que-accede-a-window-en-la-importacion')
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
      const plugin = await import('plugin-que-accede-a-window-en-la-importacion')
      app.use(plugin.default)
    }
  }
} satisfies Theme
```

### `defineClientComponent`

VitePress proporciona un auxiliar de conveniencia (helper) para importar componentes Vue que acceden a las APIs del navegador al ser importados.

```vue
<script setup>
import { defineClientComponent } from 'vitepress'

const ClientComp = defineClientComponent(() => {
  return import('componente-que-accede-a-window-en-la-importacion')
})
</script>

<template>
  <ClientComp />
</template>
```

Puede pasar propiedades/hijos/_slots_ al componente objetivo:

```vue
<script setup>
import { ref } from 'vue'
import { defineClientComponent } from 'vitepress'

const clientCompRef = ref(null)
const ClientComp = defineClientComponent(
  () => import('componente-que-accede-a-window-en-la-importacion'),

  // los argumentos se pasan a h() - https://vuejs.org/api/render-function.html#h
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
