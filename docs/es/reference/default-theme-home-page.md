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
  text: Generador de Sitios Estáticos Vite y Vue
  tagline: Lorem ipsum...
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: Comenzar
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

  // La imagen se muestra junto al texto y el eslogan.
  image?: ThemeableImage

  // Botones de acción que se mostrarán en la sección principal.
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

  // Atributo target del enlace.
  target?: string

  // Atributo rel del enlace.
  rel?: string
}
```

### Personalizando el color del nombre {#customizing-the-name-color}

VitePress usa el color de la marca (`--vp-c-brand-1`) para `name`. Sin embargo, puedes personalizar este color sobrescribiendo la variable `--vp-home-hero-name-color`.

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

## Sección de características {#features-section}

En la sección de características, puede enumerar cualquier cantidad de características que desee mostrar inmediatamente después de la sección. _Hero_. Para configurarlo seleccione la opción `features` para el frontmatter.

Puedes asignar un icono a cada característica, que puede ser un emoji o cualquier tipo de imagen. Si el icono configurado es una imagen (svg, png, jpeg, etc.), debes especificar el ancho y la altura correctos; también puedes incluir la descripción, su tamaño intrínseco y sus variantes para temas claros y oscuros, si fuera necesario.

```yaml
---
layout: home

features:
  - icon: 🛠️
    title: Simple and minimal, always
    details: Lorem ipsum...
  - icon:
      src: /icono-de-caracteristica-genial.svg
    title: Another cool feature
    details: Lorem ipsum...
  - icon:
      dark: /icono-de-caracteristica-oscuro.svg
      light: /icono-de-caracteristica-claro.svg
    title: Otra característica interesante
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // Muestra el icono en cada cuadro de característica.
  icon?: FeatureIcon

  // Título de la característica.
  title: string

  // Detalles de la características.
  details: string

  // Enlace que aparece al hacer clic en el componente de la característica.
  // El enlace puede ser interno o externo.
  //
  // ej. `guide/reference/default-theme-home-page` o `https://example.com`
  link?: string

  // Texto del enlace que se mostrará dentro del componente de característica.
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

## Contenido Markdown {#markdown-content}

Puedes agregar contenido adicional a la página de inicio de tu sitio simplemente agregando Markdown debajo del divisor del frontmatter `---`.

````md
---
layout: home

hero:
  name: VitePress
  text: Generador de Sitios Estáticos Vite y Vue
---

# Comenzar

¡Puedes empezar a usar VitePress inmediatamente usando `npx`!

```sh
npm init
npx vitepress init
```
````

::: info
VitePress no siempre aplicaba estilos automáticamente al contenido adicional de la página `layout: home`. Para volver al comportamiento anterior, puedes agregar `markdownStyles: false` al encabezado.
:::
