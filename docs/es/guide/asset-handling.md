---
description: Aprende cómo referenciar y manejar recursos estáticos como imágenes, medios y fuentes en VitePress.
---

# Manejo de Assets {#asset-handling}

## Referenciando Assets Estáticos {#referencing-static-assets}

Todos los archivos Markdown son compilados en componentes Vue y procesados por [Vite](https://vite.dev/guide/assets.html). Usted puede **y debe** referenciar cualquier asset usando URLs relativas:

```md
![Una imagen](./imagen.png)
```

Puede referenciar assets estáticos en sus archivos markdown, sus componentes `*.vue` en el tema, estilos y simples archivos `.css`, usando rutas públicas absolutas (en base a la raíz del proyecto) o rutas relativos (en base en su sistema de archivos). Este último es semejante al comportamiento que está acostumbrado se ya usó Vite, Vue CLI o el `file-loader` de webpack.

Tipos comunes de archivos de imagen, media y fuente son detectados e incluidos automáticamente como assets.

::: tip Los archivos vinculados no se tratan como recursos.
Los PDF u otros documentos a los que se hace referencia mediante enlaces dentro de archivos Markdown no se tratan automáticamente como recursos. Para que los archivos vinculados sean accesibles, debe colocarlos manualmente en el directorio [`public`](#the-public-directory) de su proyecto.
:::

Todos los assets referenciados, incluyendo aquellos usando rutas absolutas, serán copiados al directorio de salida con un nombre de archivo hash en la compilación de producción. Assets nunca referenciados no serán copiados. Assets de imagen menores que 4KB serán incorporados en base64 - esto puede ser configurado por la opción [`vite`](../reference/site-config#vite) en configuración.

Todas las referencias de rutas **estáticas**, incluyendo rutas absolutos, deben ser basadas en la estructura de su directorio de trabajo.

## El Directorio Público {#the-public-directory}

A veces, puede ser necesario proveer assets estáticos que no son referenciados directamente en ningún Markdown o componentes del tema, o usted puede querer servir ciertos archivos con el nombre del archivo original. Ejemplos de tales archivos incluyen `robots.txt`, favicons e iconos PWA.

Puede colocar esos archivos en el directorio `public` sobre el [directorio de origen](./routing#source-directory). Por ejemplo, se la raíz de su proyecto fuera `./docs` y estuviera usando ubicación por defecto del directorio fuente, entonces el directorio público será `./docs/public`.

Los assets colocados en `public` serán copiados a la raíz del directorio de salida tal como son.

Observe que usted debe referenciar archivos colocados en `public` utilizando rutas absolutas de la raíz - por ejemplo, `public/icon.png` debe siempre ser referenciado en el código fuente como `/icon.png`.

## URL Base {#base-url}

Si su sitio estuviera implantado en una URL que no sea la raíz, será necesario definir la opción `base` en `.vitepress/config.js`. Por ejemplo, se planea implantar su sitio en `https://foo.github.io/bar/`, entonces `base` debe ser definido como `'/bar/'` (siempre debe comenzar y terminar con una barra).

Todos las rutas de sus assets estáticos son procesados automáticamente para ajustarse a los diferentes valores de configuración `base`. Por ejemplo, se tuviera una referencia absoluta a un asset sobre `public` en su Markdown:

```md
![Una imagen](/imagen-dentro-de-public.png)
```

**No** necesita actualizarlo cuando altere el valor de configuración `base` en ese caso.

Sin embargo, se estuviera creando un componente de tema que vincula assets dinámicamente, por ejemplo, una imagen cuyo `src` esta basado en un valor de configuración del tema:

```vue
<img :src="theme.logoPath" />
```

En este caso, es recomendable complementar la ruta con el [auxiliar `withBase`](../reference/runtime-api#withbase) proporcionado por VitePress:

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```
