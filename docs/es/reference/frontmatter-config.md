---
outline: deep
---

# Configuración Frontmatter {#frontmatter-config}

Frontmatter permite la configuración basada en páginas. En cada archivo markdown, puede utilizar la configuración de frontmatter para anular las opciones de configuración a nivel de sitio o tema. Además, hay opciones de configuración que sólo se pueden establecer en frontmatter.

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

Título de la página. Es lo mismo que [config.title](./site-config#title), y anula la configuración a nivel de sitio.

```yaml
---
title: VitePress
---
```

## titleTemplate

- Tipo: `string | boolean`

El sufijo del título. Es lo mismo que [config.titleTemplate](./site-config#titletemplate), y anula la configuración a nivel de sitio.

```yaml
---
title: VitePress
titleTemplate: Generador de sitios web estáticos con Vite & Vue
---
```

## descripción

- Tipo: `string`

Descripción de la página. Es lo mismo que [config.description](./site-config#description), y anula la configuración a nivel de sitio.

```yaml
---
description: VitePress
---
```

## head

- Tipo: `HeadConfig[]`

Especifica etiquetas de encabezado adicionales que se inyectarán en la página actual. Se agregarán después de las etiquetas principales inyectadas por la configuración a nivel de sitio.

```yaml
---
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: super duper SEO
---
```

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## Solo Tema Predeterminado {#default-theme-only}

Las siguientes opciones de frontmatter solo se aplican cuando se usa el tema predeterminado.

### layout

- Tipo: `doc | home | page`
- Predeterminado: `doc`

Determina el layout de la página.

- `doc` - Aplica estilos de documentación por defecto al contenido markdown.
- `home` - Layout especial para la "Página Inicial". Puedes agregar opciones extras como `hero` y `features` para crear rapidamente una hermosa página inicial.
- `page` - Se comporta de manera similar a `doc`, pero no aplica estilos al contenido. Útil cuando desea crear una página totalmente personalizada.

```yaml
---
layout: doc
---
```

### hero <Badge type="info" text="apenas para página inicial" />

Define el contenido de la sección _hero_ en la página inicial cuando `layout` está definido como `home`. Más detalles en [Tema Predeterminado: Página Inicial](./default-theme-home-page).

### features <Badge type="info" text="apenas para página inicial" />

Define los elementos que se mostrarán en la sección de características cuando `layout` está definido como `home`. Más detalles en [Tema Predeterminado: Página Inicial](./default-theme-home-page).

### navbar

- Tipo: `boolean`
- Predeterminado: `true`

Se debe mostrar una [barra de navegación](./default-theme-nav).

```yaml
---
navbar: false
---
```

### sidebar

- Tipo: `boolean`
- Predeterminado: `true`

Se debe mostrar una [barra lateral](./default-theme-sidebar).

```yaml
---
sidebar: false
---
```

### aside

- Tipo: `boolean | 'left'`
- Predeterminado: `true`

Define la localización del componente aside en el layout `doc`.

Configurar este valor como `false` evita que se muestre el elemento lateral.\
Configurar este valor como `true` presenta el lado de la derecha.\
Configurar este valor como `'left'` presenta el lado de la izquierda.

```yaml
---
aside: false
---
```

### outline

- Tipo: `number | [number, number] | 'deep' | false`
- Predeterminado: `2`

Los niveles del encabezado en _outline_ que se mostrará para la página. Es lo mismo que [config.themeConfig.outline.level](./default-theme-config#outline), y anula el valor establecido en la configuración a nivel de sitio.

### lastUpdated

- Tipo: `boolean | Date`
- Predeterminado: `true`

Se debe mostrar el texto de [última actualización](./default-theme-last-updated) en el pie de página de la página actual. Si se especifica una fecha y hora específicas, se mostrarán en lugar de la hora de la última modificación de git.

```yaml
---
lastUpdated: false
---
```

### editLink

- Tipo: `boolean`
- Predeterminado: `true`

Se debe mostrar el [link de edición](./default-theme-edit-link) en el pie de página de la página actual.

```yaml
---
editLink: false
---
```

### footer

- Tipo: `boolean`
- Predeterminado: `true`

Se debe mostrar el [pie de página](./default-theme-footer).

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
pageClass: custom-page-class
---
```

Luego puede personalizar los estilos para esta página específica en el archivo. `.vitepress/theme/custom.css`:

```css
.custom-page-class {
  /* estilos especificos de la página */
}
```
