# Editar Link {#edit-link}

## Configuración a nivel de sitio {#site-level-config}

Editar enlace le permite mostrar un enlace para editar la página con servicios de administración de Git como GitHub o GitLab. Para habilitar, agregue la opción `themeConfig.editLink` en su configuración.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

La opción `pattern` define una estructura de URL para el enlace, y `:path` se reemplaza con la misma ruta de la página

También puedes poner una función pura que acepte [`PageData`](./runtime-api#usedata) como argumento y retorna una URL en string.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: ({ filePath }) => {
        if (filePath.startsWith('packages/')) {
          return `https://github.com/acme/monorepo/edit/main/${filePath}`
        } else {
          return `https://github.com/acme/monorepo/edit/main/docs/${filePath}`
        }
      }
    }
  }
}
```

Esto no debería generar efectos secundarios ni acceder a nada fuera de su alcance, ya que será serializado y ejecutado en el navegador.

De forma predeterminada, esto agregará el enlace con el texto 'Editar esta página' al final de la página de documentación. Puedes personalizar este texto configurando la opción `text`.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edite la página en GitHub'
    }
  }
}
```

## Configuración Frontmatter {#frontmatter-config}

La funcionalidad se puede desactivar por página utilizando la opción `editLink` en frontmatter:

```yaml
---
editLink: false
---
```
