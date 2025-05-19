# Manejo de Assets {#asset-handling}

## Referenciando Assets Estáticos {#referencing-static-assets}

Todos los archivos Markdown son compilados en componentes Vue y procesados por [Vite](https://vitejs.dev/guide/assets.html). Usted puede **y debe** referenciar cualquier asset usando URLs relativas:

```md
![Una imagen](./imagen.png)
```

Puede referenciar assets estáticos en sus archivos markdown, sus componentes `*.vue` en el tema, estilos y simples archivos `.css`, usando paths públicos absolutos (com base en la raiz del projeto) o paths relativos (con base en su sistema de arhivos). Este último es semejante al comportamiento que está acostumbrado se ya usó Vite, Vue CLI o el `file-loader` de webpack.

Tipos comunes de archivos de imagen, media y fuente son detectados e incluidos automaticamente como assets.

Todos los assets referenciados, incluyendo aquellos usando paths absolutos, serán copiados al directorio de salida con un nombre de archivo hash en la compilación de producción. Assets nunca referenciados no serán copiados. Assets de imagen menores que 4KB serán incorporados en base64 - esto puede ser configurado por la opción [`vite`](../reference/site-config#vite) en configuración.

Todas las referencias de path **estáticas**, incluyendo paths absolutos, deben ser basadas en la estructura de su directorio de trabajo.

## El directorio público {#the-public-directory}

A veces, puede ser necesario proveer assets estáticos que no son referenciados directamente en ninguno de sus componentes del tema o Markdown, o usted puede querer servir ciertos archivos con el nombre del archivo original. Ejemplos de tales archivos incluyen `robots.txt`, favicons e iconos PWA.

Puede colocar esos archivos en el directorio `public` sobre el [directorio de origen](./routing#source-directory). Por ejemplo, se la raiz de su proyecto fuera `./docs` y estuviera usando localización por defecto del directorio fuente, entonces el directorio público será `./docs/public`.

Los assets colocados en `public` serán copiados a la raiz del directorio de salida tal como son.

Observe que usted debe referenciar archivos colocados en `public` usando e path absoluto de la raiz - por ejemplo, `public/icon.png` debe siempre ser referenciado en el código fuente como `/icon.png`.

## URL Base {#base-url}

Si su sitio estuviera implantado en una URL que no sea la raiz, será necesario definir la opción `base` en `.vitepress/config.js`. Por ejemplo, se planea implantar su sitio en `https://foo.github.io/bar/`, entonces `base` debe ser definido como `'/bar/'` (siempre debe comenzar y terminar con una barra).

Todos los paths de sus assets estáticos son procesados automáticamente para ajustarse a los diferentes valores de configuración `base`. Por ejemplo, se tuviera una referencia absoluta a un asset sobre `public` en su Markdown:

```md
![Una imagen](/imagen-dentro-de-public.png)
```

**No** necesita actualizarlo cuando altere el valor de configuración `base` en ese caso.

Sin embargo, se estuviera creando un componente de tema que vincula assets dinámicamente, por ejemplo, una imagen cuyo `src` esta basado en un valor de configuración del tema:

```vue
<img :src="theme.logoPath" />
```

En este caso, es recomendable complementar el path con el [`auxiliar withBase`](../reference/runtime-api#withbase) proporcionado por VitePress:

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```
