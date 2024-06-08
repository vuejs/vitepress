# Navegación {#nav}

Refiriéndose a la barra de navegación que se muestra en la parte superior de la página. Contiene el título del sitio, enlaces del menú global, etc.

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
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

También puedes pasar un objeto como logotipo si quieres agregar un atributo. `alt` o personalizarlo según el modo claro/oscuro. Consultar [`themeConfig.logo`](./default-theme-config#logo) para obtener más detalles.

## Links de Navegación {#navigation-links}

Puedes configurar la opción `themeConfig.nav` para añadir enlaces a tu navegación.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guia', link: '/guide' },
      { text: 'Configuración', link: '/config' },
      { text: 'Registro de Cambios', link: 'https://github.com/...' }
    ]
  }
}
```

`text` es el texto que se muestra en la navegación, y el `link` es el link al que será navegando cuando se hace click en el texto. Para el enlace, establezca la ruta al archivo sin el prefijo `.md` y siempre comenzar por `/`.

Links de navegación también pueden ser menus _dropdown_. Para hacer eso, establezca la clave de `items` en la opción del link.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guia', link: '/guide' },
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
      { text: 'Guia', link: '/guia' },
      {
        text: 'Menú Dropdown',
        items: [
          {
            // Título da seção.
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
              { text: 'Item A da Seção A', link: '...' },
              { text: 'Item B da Seção B', link: '...' }
            ]
          }
        ]
      }
    ]
  }
}
```

### Personaliza el estado "activo" del link {#customize-link-s-active-state}

Los elementos del menú de navegación se resaltarán cuando la página actual esté en la ruta correspondiente. Si desea personalizar la ruta que debe coincidir, establezca la propiedad `activeMatch` el regex como um valor en string.

```js
export default {
  themeConfig: {
    nav: [
      // Este link esta en estado activo cuando
      // el usuario esta en el camino `/config/`.
      {
        text: 'Guia',
        link: '/guide',
        activeMatch: '/config/'
      }
    ]
  }
}
```

::: warning
`activeMatch` Debería ser un string regex, pero deberías definirla como un string. No podemos usar un objeto RegExp real aquí porque no es serializable durante el tiempo de construcción.
:::

### Personalizar los atributos "target" y "rel" de links {#customize-link-s-target-and-rel-attributes}

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

## Links Scociales {#social-links}

Consulte [`socialLinks`](./default-theme-config#sociallinks).
