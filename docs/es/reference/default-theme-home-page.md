---
description: Configura el diseño de la página de inicio del tema predeterminado de VitePress con secciones hero, características y contenido personalizado.
---

# Página Inicial {#home-page}

El tema predeterminado de VitePress proporciona un diseño de página de inicio, que también puedes ver en uso [en la página de inicio de este sitio web](../). Puedes usarlo en cualquiera de sus páginas especificando `layout: home` en [frontmatter](./frontmatter-config).

```yaml
---
layout: home
---
```

Sin embargo, esta opción por sí sola no sirve de mucho. Puede agregar varias "secciones" predefinidas diferentes a la página de inicio configurando opciones adicionales como `hero` y `features`.

## Sección Hero {#hero-section}

La sección _Hero_ queda en la parte superior de la página de inicio. Asi es como se puede configurar la sección _Hero_.

```yaml
---
layout: home

hero:
  name: VitePress
  text: Generador de sitios web estáticos con Vite & Vue.
  tagline: Lorem ipsum...
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: Iniciar
      link: /guide/what-is-vitepress
    - theme: alt
      text: Ver en GitHub
      link: https://github.com/vuejs/vitepress
---
```

```ts
interface Hero {
  // El string que se muestra encima del `text`. Viene con el color de la marca
  // y se espera que sea breve, como el nombre del producto.
  name?: string

  // El texto principal de la sección de hero.
  // Esto se definirá como un tag `h1`.
  text: string

  // Eslogan que se muestra abajo del `text`.
  tagline?: string

  // La imagen se muestra junto al área de texto y eslogan.
  image?: ThemeableImage

  // Botones accionables para mostrar en la sección principal de la página de inicio.
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // Tema de color de botón. Estándar: `brand`.
  theme?: 'brand' | 'alt'

  // Etiqueta del botón.
  text: string

  // Destino del enlace del botón.
  link: string

  // Atributo target del link.
  target?: string

  // Atributo rel del link.
  rel?: string
}
```

### Personalizando el color del nombre {#customizing-the-name-color}

VitePress usa el color de la marca (`--vp-c-brand-1`) para `name`. Sin embargo, puedes personalizar este color anulando la variable `--vp-home-hero-name-color`.

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

También puedes personalizarlo aún más combinando  `--vp-home-hero-name-background` para dar al `name` un color degradado.

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## Sección de caracteristicas {#features-section}

En la sección de funciones, puede enumerar cualquier cantidad de funciones que desee mostrar inmediatamente después de la sección. _Hero_. Para configurarlo seleccione la opción `features` para el frontmatter.

Puede proporcionar un icono para cada función, que puede ser un emoji o cualquier tipo de imagen. Cuando el icono configurado es una imagen (svg, png, jpeg...), debes proporcionar al ícono el ancho y alto apropiados; También puedes proporcionar la descripción, su tamaño intrínseco y sus variantes para temas oscuros y claros cuando sea necesario.

```yaml
---
layout: home

features:
  - icon: 🛠️
    title: Sencillo y minimalista, siempre
    details: Lorem ipsum...
  - icon:
      src: /cool-feature-icon.svg
    title: Otra caracteristica interesante
    details: Lorem ipsum...
  - icon:
      dark: /dark-feature-icon.svg
      light: /light-feature-icon.svg
    title: Otra caracteristica interesante
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // Muestra el icono en cada cuadro de función.
  icon?: FeatureIcon

  // Título de la caracteristica.
  title: string

  // Detalles de la caracteristicas.
  details: string

  // Enlace al hacer clic en el componente de funcionalidad
  // El vínculo puede ser interno o externo.
  //
  // ej. `guide/reference/default-theme-home-page` ou `https://example.com`
  link?: string

  // Texto del enlace que se mostrará dentro del componente de funcionalidad.
  //  Mejor usado con opción `link`.
  //
  // ej. `Sepa más`, `Visitar página`, etc.
  linkText?: string

  // Atributo rel de enlace para la opción `link`.
  //
  // ej. `external`
  rel?: string

  // Atributo de destino del enlace para la opción `link`.
  target?: string
}

type FeatureIcon =
  | string
  | { src: string; alt?: string; width?: string; height: string }
  | {
      light: string
      dark: string
      alt?: string
      width?: string
      height: string
    }
```
