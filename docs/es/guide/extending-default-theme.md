---
outline: deep
---

# Extendiendo el Tema por defecto {#extending-the-default-theme}

El tema por defecto de VitePress es optimizado para documentación y puede ser personalizado. Consulte la [Visión General de Configuración del Tema por Defecto](../reference/default-theme-config) para una lista completa de opciones.

Sin embargo, hay casos en que apenas la configuración no será suficiente. Por ejemplo:

1. Es necesario ajustar los estilos CSS;
2. Es necesario modificar la instancia de la aplicación Vue, por ejemplo para registrar componentes globales;
3. Es necesario inyectar contenido personalizado en el tema por medio de _slots_ en el layout.

Esas personalizaciones avanzadas exigirán el uso de un tema personalizado que "extiende" el tema por defecto.

::: tip
Antes de seguir, asegurese de leer primero [Usando un Tema Personalizado](./custom-theme) para entender como funcionan los temas personalizados.
:::

## Personalizando el CSS {#customizing-css}

El CSS del tema por defecto puede ser personalizado substuyendo las variables CSS a nivel de la raiz:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/custom.css */
:root {
  --vp-c-brand-1: #646cff;
  --vp-c-brand-2: #747bff;
}
```

Vea las [variables CSS del tema por defecto](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css) que pueden ser substituídas.

## Usando Fuentes Diferentes {#using-different-fonts}

VitePress usa [Inter](https://rsms.me/inter/) como fuente por defecto e incluirá las fuentes en la salida de compilación. La fuente también es pre-cargada automaticamente en producción. Sin embargo, eso puede no ser deseable se quiere usar una fuente principal diferente.

Para evitar la inclusión de Inter en la salida de compilación, importe el tema de `vitepress/theme-without-fonts`:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme-without-fonts'
import './my-fonts.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/my-fonts.css */
:root {
  --vp-font-family-base: /* fuente de texto normal */
  --vp-font-family-mono: /* fuente de código */
}
```

::: warning
Si está usando componentes opcionales como los componentes de la [Página del equipo](../reference/default-theme-team-page), asegurese de también importarlos de `vitepress/theme-without-fonts`!
:::

Si su fuente es un archivo local referenciado via `@font-face`, ella será procesada como un asset e incluida en `.vitepress/dist/assets` con un nombre de archivo hash. Para pre-cargar ese archivo, use el hook de construcción [transformHead](../reference/site-config#transformhead):

```js [.vitepress/config.js]
export default {
  transformHead({ assets }) {
    // ajuste el regex para corresponder a su fuente
    const myFontFile = assets.find(file => /font-name\.\w+\.woff2/)
    if (myFontFile) {
      return [
        [
          'link',
          {
            rel: 'preload',
            href: myFontFile,
            as: 'font',
            type: 'font/woff2',
            crossorigin: ''
          }
        ]
      ]
    }
  }
}
```

## Registrando Componentes Globales {#registering-global-components}

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // registre sus componentes globales personalizados
    app.component('MyGlobalComponent' /* ... */)
  }
}
```

Si está usando TypeScript:
```ts [.vitepress/theme/index.ts]
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // registre sus componentes globales personalizados
    app.component('MyGlobalComponent' /* ... */)
  }
} satisfies Theme
```

Como estamos usando Vite, puede también aprovechar la [funcionalidad de importación glob](https://vitejs.dev/guide/features.html#glob-import) de Vite para registrar automaticamente un directorio de componetes.

## _Slots_ en el Layout {#layout-slots}

El componente `<Layout/>` del tema por defecto posee algunos _slots_ que pueden ser usados para inyectar contenido en lugares específicos de la página. Aqui un ejemplo de como inyectar un componente antes del esquema:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  // substituya el Layout por un componente wrapper que
  // inyecta los slots
  Layout: MyLayout
}
```

```vue [.vitepress/theme/MyLayout.vue]
<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-outline-before>
      Mi contenido personalizado superior de la barra lateral
    </template>
  </Layout>
</template>
```

O puede también usar la función _render_.

```js [.vitepress/theme/index.js]
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MyComponent from './MyComponent.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-outline-before': () => h(MyComponent)
    })
  }
}
```

Lista completa de _slots_ disponibles en el layout del tema por defecto:

- Cuando `layout: 'doc'` (por defecto) está habilitado via frontmatter:
  - `doc-top`
  - `doc-bottom`
  - `doc-footer-before`
  - `doc-before`
  - `doc-after`
  - `sidebar-nav-before`
  - `sidebar-nav-after`
  - `aside-top`
  - `aside-bottom`
  - `aside-outline-before`
  - `aside-outline-after`
  - `aside-ads-before`
  - `aside-ads-after`
- Cuando `layout: 'home'` está habilitado via frontmatter:
  - `home-hero-before`
  - `home-hero-info-before`
  - `home-hero-info`
  - `home-hero-actions-after`
  - `home-hero-image`
  - `home-hero-after`
  - `home-features-before`
  - `home-features-after`
- Cuando `layout: 'page'` está habilitado via frontmatter:
  - `page-top`
  - `page-bottom`
- En la página no encontrada (404):
  - `not-found`
- Siempre:
  - `layout-top`
  - `layout-bottom`
  - `nav-bar-title-before`
  - `nav-bar-title-after`
  - `nav-bar-content-before`
  - `nav-bar-content-after`
  - `nav-screen-content-before`
  - `nav-screen-content-after`

## Usando el API View Transitions

### En la Alternancia de Apariencia {#on-appearance-toggle}

Puede extender el tema por defecto para proporcionar una transición personalizada cuando el modo de color es alternado. Un ejemplo:

```vue [.vitepress/theme/Layout.vue]
<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide } from 'vue'

const { isDark } = useData()

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )
})
</script>

<template>
  <DefaultTheme.Layout />
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
```

Resultado (**atención!**: colores destellantes, movimientos súbitos, luces brillantes):

<details>
<summary>Demo</summary>

![Demo de Transición de Alternancia de Apariencia](/appearance-toggle-transition.webp)

</details>

Consulte [Chrome Docs](https://developer.chrome.com/docs/web-platform/view-transitions/) para mas detalles sobre _view transitions_.

### En el Cambio de Ruta {#on-route-change}

En breve.

## Substituyendo Componentes Internos {#overriding-internal-components}

Puede usar los [aliases](https://vitejs.dev/config/shared-options.html#resolve-alias) Vite para substituir los componentes del tema por defecto por los suyos personalizados:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(
            new URL('./components/CustomNavBar.vue', import.meta.url)
          )
        }
      ]
    }
  }
})
```

Para saber el nombre exacto del componente consulte [nuestro código fuente](https://github.com/vuejs/vitepress/tree/main/src/client/theme-default/components). Como los componentes son internos, hay una pequeña chance de que el nombre sea actualizado entre lanzamientos secundarios.
