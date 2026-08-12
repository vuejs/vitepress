---
description: Configura la barra de navegación en el tema predeterminado de VitePress, incluyendo el título del sitio, el logotipo y los enlaces del menú.
---

# Navegación {#nav}

La barra de navegación (Nav) se muestra en la parte superior de la página. Contiene el título del sitio, enlaces del menú global, etc.

## Título y logotipo del sitio {#site-title-and-logo}

Por defecto, la navegación muestra el título del sitio que hace referencia al valor de [`config.title`](./site-config#title). Si desea cambiar lo que se muestra en la navegación, puede configurar un texto personalizado en el `themeConfig.siteTitle`.

```js
export default {
  themeConfig: {
    siteTitle: 'Mi Título Personalizado'
  }
}
```

Si tiene un logotipo para su sitio web, puede mostrarlo pasando la ruta a la imagen. Debes colocar el logo directamente dentro de la carpeta. `public`, y establezca la ruta absoluta hacia él.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

Cuando agrega un logotipo, se muestra junto con el título del sitio. Si su logotipo tiene todo lo que necesita y desea ocultar el texto del título, configure `false` en la opción `siteTitle`.

```js
export default {
  themeConfig: {
    logo: '/mi-logo.svg',
    siteTitle: false
  }
}
```

También puedes pasar un objeto como logotipo si quieres agregar un atributo. `alt` o personalizarlo según el modo claro/oscuro. Consultar [`themeConfig.logo`](./default-theme-config#logo) para obtener más detalles.

## Enlace de Navegación {#navigation-links}

Puedes configurar la opción `themeConfig.nav` para añadir enlaces a tu navegación.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guía', link: '/guide' },
      { text: 'Configuración', link: '/config' },
      { text: 'Registro de Cambios', link: 'https://github.com/...' }
    ]
  }
}
```

`text` es el texto que se muestra en la navegación, y el `link` es el enlace al que será navegando cuando se hace click en el texto. Para el enlace, establezca la ruta al archivo sin el prefijo `.md` y siempre comenzar por `/`.

El `link` también puede ser una función que acepte [`PageData`](./runtime-api#usedata) como argumento y devuelva la ruta.

Los Enlaces de navegación también pueden ser menus _dropdown_. Para hacer eso, establezca la clave de `items` en la opción del enlace.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guía', link: '/guide' },
      {
        text: 'Menú Dropdown',
        items: [
          { text: 'Item A', link: '/item-1' },
          { text: 'Item B', link: '/item-2' },
          { text: 'Item C', link: '/item-3' }
        ]
      }
    ]
  }
}
```

Tenga en cuenta que el titulo del menú _dropdown_ (`Menu Dropdown` en el ejemplo anterior) no puede tener una propiedad `link`, ya que se convierte en un botón para abrir el cuadro del dialogo dropdown.

También puedes agregar "secciones" a los elementos del menú _dropdown_ pasando más elementos anidados.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guía', link: '/guia' },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // Título de la sección.
            text: 'Título de la sección A',
            items: [
              { text: 'Item A de la sección A', link: '...' },
              { text: 'Item B de la sección B', link: '...' }
            ]
          }
        ]
      },
      {
        text: 'Menú Dropdown',
        items: [
          {
            // También puedes omitir el título
            items: [
              { text: 'Item A de la sección A', link: '...' },
              { text: 'Item B de la sección B', link: '...' }
            ]
          }
        ]
      }
    ]
  }
}
```

### Personaliza el estado "activo" del enlace {#customize-link-s-active-state}

Los elementos del menú de navegación se resaltarán cuando la página actual esté en la ruta correspondiente. Si desea personalizar la ruta que debe coincidir, establezca la propiedad `activeMatch` el regex como un valor en string.

```js
export default {
  themeConfig: {
    nav: [
      // Este enlace se activa cuando el usuario está
      // en la ruta `/config/`.
      {
        text: 'Guía',
        link: '/guia',
        activeMatch: '/config/'
      }
    ]
  }
}
```

::: warning
`activeMatch` Debería ser un string regex, pero deberías definirla como un string. No podemos usar un objeto RegExp real aquí porque no es serializable durante el tiempo de compilación.
:::

### Personaliza los atributos "target" y "rel" del enlace. {#customize-link-s-target-and-rel-attributes}

Por defecto, VitePress determina automáticamente lod atributos `target` y `rel` en función de si existe un enlace externo o no. Pero si quieres, también puedes personalizarlos.

```js
export default {
  themeConfig: {
    nav: [
      {
        text: 'Merchandise',
        link: 'https://www.thegithubshop.com/',
        target: '_self',
        rel: 'sponsored'
      }
    ]
  }
}
```

## Enlaces Sociales {#social-links}

Consulte [`socialLinks`](./default-theme-config#sociallinks).

## Componentes Personalizados {#custom-components}

Puedes incluir componentes personalizados en la barra de navegación usando la opción `component`. La clave `component` debe ser el nombre del componente Vue y debe registrarse globalmente usando [Theme.enhanceApp](../guide/custom-theme#theme-interface).

```js [.vitepress/config.js]
export default {
  themeConfig: {
    nav: [
      {
        text: 'Mi Menu',
        items: [
          {
            component: 'MiComponentePersonalizado',
            // Optional props to pass to the component
            props: {
              title: 'Mi Componente Personalizado'
            }
          }
        ]
      },
      {
        component: 'OtroComponentePersonalizado'
      }
    ]
  }
}
```

Luego, debes registrar el componente globalmente:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

import MiComponentePersonalizado from './components/MiComponentePersonalizado.vue'
import OtroComponentePersonalizado from './components/OtroComponentePersonalizado.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MiComponentePersonalizado', MyCustomComponent)
    app.component('OtroComponentePersonalizado', AnotherCustomComponent)
  }
}
```

Tu componente se mostrará en la barra de navegación. VitePress le proporcionará las siguientes propiedades adicionales:

- `screenMenu`: un valor booleano opcional que indica si el componente se encuentra dentro del menú de navegación móvil.

Puedes consultar un ejemplo en las pruebas e2e [aquí](https://github.com/vuejs/vitepress/tree/main/__tests__/e2e/.vitepress).
