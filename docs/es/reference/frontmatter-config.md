---
outline: deep
description: Referencia de todas las opciones de configuración de frontmatter disponibles para las páginas Markdown de VitePress.
---

# Configuración de frontmatter {#frontmatter-config}

El `frontmatter` permite la configuración basada en la página. En cada archivo Markdown, puede utilizar la configuración del `frontmatter` para sobrescribir las opciones de configuración a nivel del sitio o a nivel del tema. Además, hay opciones de configuración que solo se pueden definir en el `frontmatter`.

Ejemplo de uso:

```md
---
title: Documentación con VitePress
editLink: true
---
```

Puede acceder a los datos del frontmatter a través de la variable global `$frontmatter` en expresiones Vue:

```md
{{ $frontmatter.title }}
```

## title

- Tipo: `string`

Título de la página. Es igual a [config.title](./site-config#title) y sobrescribe la configuración a nivel del sitio.

```yaml
---
title: VitePress
---
```

## titleTemplate

- Tipo: `string | boolean`

El sufijo del título. Es igual a [config.titleTemplate](./site-config#titletemplate) y sobrescribe la configuración a nivel del sitio.

```yaml
---
title: VitePress
titleTemplate: Generador de Sitios Estáticos desarrollado con Vite y Vue.
---
```

## description

- Tipo: `string`

Descripción de la página. Es igual a [config.description](./site-config#description) y sobrescribe la configuración a nivel del sitio.

```yaml
---
description: VitePress
---
```

## head

- Tipo: `HeadConfig[]`

Especifica las etiquetas `head` adicionales que se inyectarán para la página actual. Se agregarán después de las etiquetas `head` inyectadas por la configuración a nivel del sitio.

```yaml
---
head:
  - - meta
    - name: description
      content: hola
  - - meta
    - name: keywords
      content: super increíble SEO
---
```

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## Solo Tema Predeterminado {#default-theme-only}

Las siguientes opciones de frontmatter solo son aplicables cuando se utiliza el tema predeterminado.

### layout

- Tipo: `doc | home | page`
- Predeterminado: `doc`

Determina el `layout` de la página.

- `doc` - Aplica los estilos de documentación predeterminados al contenido Markdown.
- `home` - `layout` especial para la "Página de inicio". Puede agregar opciones adicionales como `hero` y `features` para crear rápidamente una hermosa página de inicio.
- `page` - Se comporta de manera similar a `doc`, pero no aplica estilos al contenido. Es útil cuando desea crear una página totalmente personalizada.

```yaml
---
layout: doc
---
```

### hero <Badge type="info" text="solo página de inicio" />

Define los contenidos de la sección _hero_ de la página de inicio cuando `layout` está establecido en `home`. Más detalles en [Tema predeterminado: Página de inicio](./default-theme-home-page).

### features <Badge type="info" text="solo página de inicio" />

Define los elementos que se mostrarán en la sección de características cuando `layout` está establecido en `home`. Más detalles en [Tema predeterminado: Página de inicio](./default-theme-home-page).

### navbar

- Tipo: `boolean`
- Predeterminado: `true`

Indica si se debe mostrar la [barra de navegación](./default-theme-nav).

```yaml
---
navbar: false
---
```

### sidebar

- Tipo: `boolean`
- Predeterminado: `true`

Indica si se debe mostrar la [barra lateral](./default-theme-sidebar).

```yaml
---
sidebar: false
---
```

### aside

- Tipo: `boolean | 'left'`
- Predeterminado: `true`

Define la ubicación del componente lateral en el `layout` `doc`.

Establecer este valor en `false` evita renderizar el contenedor lateral.\
Establecer este valor en `true` renderiza el contenedor lateral a la derecha.\
Establecer este valor en `'left'` renderiza el contenedor lateral a la izquierda.

```yaml
---
aside: false
---
```

### outline

- Tipo: `number | [number, number] | 'deep' | false`
- Predeterminado: `2`

Los niveles de encabezado en el esquema (_outline_) que se mostrarán para la página. Es igual a [config.themeConfig.outline.level](./default-theme-config#outline) y sobrescribe el valor establecido en la configuración a nivel del sitio.

```yaml
---
outline: [2, 4]
---
```

### lastUpdated

- Tipo: `boolean | Date`
- Predeterminado: `true`

Indica si se debe mostrar el texto de [última actualización](./default-theme-last-updated) en el pie de página de la página actual. Si se especifica una fecha y hora, se mostrará en lugar de la marca de tiempo de la última modificación de git.

```yaml
---
lastUpdated: false
---
```

### editLink

- Tipo: `boolean`
- Predeterminado: `true`

Indica si se debe mostrar el [enlace de edición](./default-theme-edit-link) en el pie de página de la página actual.

```yaml
---
editLink: false
---
```

### footer

- Tipo: `boolean`
- Predeterminado: `true`

Indica si se debe mostrar el [pie de página](./default-theme-footer).

```yaml
---
footer: false
---
```

### pageClass

- Tipo: `string`

Agrega un nombre de clase adicional a una página específica.

```yaml
---
pageClass: clase-de-pagina-personalizada
---
```

Luego puede personalizar los estilos de esta página específica en el archivo `.vitepress/theme/custom.css`:

```css
.clase-de-pagina-personalizada {
  /* estilos específicos de la página */
}
```

### isHome

- Tipo: `boolean`

El tema predeterminado se basa en comprobaciones como `frontmatter.layout === 'home'` para determinar si la página actual es la página de inicio.\
Esto es útil cuando desea forzar la visualización de los elementos de la página de inicio en un `layout` personalizado.

```yaml
---
isHome: true
---
```