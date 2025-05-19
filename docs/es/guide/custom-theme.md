# Usando un Tema Personalizado {#using-a-custom-theme}

## Carga de Tema {#theme-resolving}

Puede habilitar un tema personalizado creando un archivo `.vitepress/theme/index.js` o `.vitepress/theme/index.ts` (o "archivo de entrada de tema"):

```
.
├─ docs                # raiz del proyecto
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.js   # entrada de tema
│  │  └─ config.js     # archivo de configuración
│  └─ index.md
└─ package.json
```

VitePress siempre usará el tema personalizado en vez del tema por defecto cuando detecte la precencia de un archivo de entrada de tema. Sin embargo, puede [extender el tema por defecto](./extending-default-theme) para realizar personalizaciones avanzadas sobre el.

## Interfaz del Tema {#theme-interface}

Un tema personalizado de VitePress es definifo como un objeto con la siguiente interfaz:

```ts
interface Theme {
  /**
   * Componente raiz de layout para todas las páginas
   * @required
   */
  Layout: Component
  /**
   * Mejora la instancia de la aplicación Vue
   * @optional
   */
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  /**
   * Extiende otro tema, llamando su `enhanceApp` antes de nuestro
   * @optional
   */
  extends?: Theme
}

interface EnhanceAppContext {
  app: App // instancia de la aplicación Vue
  router: Router // instancia del enrutador VitePress
  siteData: Ref<SiteData> // Metadata a nivel del sitio
}
```

El archivo de entrada del tema debe exportar el tema como su exportación por defecto:

```js [.vitepress/theme/index.js]

// Puede importar archivos Vue directamente en el archivo de entrada del tema
// VitePress ya está preconfigurado con @vitejs/plugin-vue.
import Layout from './Layout.vue'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
```

La exportación por defecto es el único contrato para un tema personalizado, y apenas la propiedad `Layout` es exigida. Tecnicamente, un tema de VitePress puede ser tan simple como un único componente Vue.

Dentro de su componente de layout, el funciona como una aplicación Vite + Vue 3 normal. Note que el tema también necesita ser [compatible con SSR](./ssr-compat).

## Construyendo un Layout {#building-a-layout}

El componente de layout más básico necesita un componente [`<Content />`](../reference/runtime-api#content):

```vue [.vitepress/theme/Layout.vue]
<template>
  <h1>Layout Personalizado!</h1>

  <!-- aqui es donde el contenido markdown será presentado -->
  <Content />
</template>
```

El layout encima simplemente renderiza el markdown de todas las páginas cómo HTML. La primera mejora que podemos adicionar es lidiar con errores 404:

```vue{1-4,9-12}
<script setup>
import { useData } from 'vitepress'
const { page } = useData()
</script>

<template>
  <h1>Layout Personalizado!</h1>

  <div v-if="page.isNotFound">
    Página 404 personalizada!
  </div>
  <Content v-else />
</template>
```

El auxiliar [`useData()`](../reference/runtime-api#usedata) proporciona todos los datos en tiempo de ejecución que necesitamos para mostrar layouts diferentes. Uno de los otros datos que podemos accesar es el frontmatter de la página actual. Podemos aprovechar esto para permitir que el usuario final controle el layout en cada página. Por ejemplo, el usuario puede indicar que la página debe usar un layout especial de la pagina inicial con:

```md
---
layout: home
---
```

Y podemos ajustar nuestro tema para lidiar con esto:

```vue{3,12-14}
<script setup>
import { useData } from 'vitepress'
const { page, frontmatter } = useData()
</script>

<template>
  <h1>Layout Personalizado!</h1>

  <div v-if="page.isNotFound">
    Página 404 personalizada!
  </div>
  <div v-if="frontmatter.layout === 'home'">
    Página inicial personalizada!
  </div>
  <Content v-else />
</template>
```

Puede, claro está, dividir el layout en más componentes:

```vue{3-5,12-15}
<script setup>
import { useData } from 'vitepress'
import NotFound from './NotFound.vue'
import Home from './Home.vue'
import Page from './Page.vue'

const { page, frontmatter } = useData()
</script>

<template>
  <h1>Layout Personalizado!</h1>

  <NotFound v-if="page.isNotFound" />
  <Home v-if="frontmatter.layout === 'home'" />
  <Page v-else /> <!-- <Page /> renders <Content /> -->
</template>
```

Consulte la [Referencia del API en tiempo de Ejecución](../reference/runtime-api) para todo lo que está disponible en componentes de tema. Además, puede aprovechar la [Carga de datos en Tiempo de Compilación](./data-loading) para generar layouts orientados por datos - por ejemplo, una página que lista todos los posts del blog en el proyecto actual.

## Distribuyendo un Tema Personalizado {#distributing-a-custom-theme}

La manera más facil de distribuir un tema personalizado es proporcionarlo como un [repositorio de template en GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository).

Si desea distribuir su tema como un paquete npm, siga estos pasos:

1. Exporte el objeto del tema como la exportación por defecto en su archivo de paquete.

2. Si aplica, exporte la definición de configuración del tipo de tema como `ThemeConfig`.

3. Si su tema exige ajustes en la configuración de VitePress, exporte esa configuración en un subdirectorio del paquete (por ejemplo, `mi-tema/config`) para que el usuario pueda extenderlo.

4. Documente las opciones de configuración del tema (Ambos, via archivo y frontmatter).

5. Proporcione instrucciones claras sobre cómo consumir su tema(vea abajo).

## Consumiendo un Tema Personalizado {#consuming-a-custom-theme}

Para consumir un tema extereno, importelo e reexportelo a partir del archivo de entrada del tema personalizado:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default Theme
```

Si el tema necesita ser extendido:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default {
  extends: Theme,
  enhanceApp(ctx) {
    // ...
  }
}
```

Si el tema exige una configuración especial de VitePress, también necesitará extenderlo en su propia configuración:

```ts
// .vitepress/theme/config.ts
import baseConfig from 'awesome-vitepress-theme/config'

export default {
  // extienda la configuración base del tema (de ser necesario)
  extends: baseConfig
}
```

Finalmente, si el tema proporciona tipos para la configuración del tema:

```ts
// .vitepress/theme/config.ts
import baseConfig from 'awesome-vitepress-theme/config'
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'awesome-vitepress-theme'

export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,
  themeConfig: {
    // El tipo es `ThemeConfig`
  }
})
```
