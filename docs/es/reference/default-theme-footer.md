# Pie de página {#footer}

VitePress mostrará un pie de página global en la parte inferior de la página cuando `themeConfig.footer` está presente.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Publicado bajo la licencia MIT.',
      copyright: 'Derechos de autor © 2019-present Evan You'
    }
  }
}
```

```ts
export interface Footer {
  // El mensaje mostrado justo antes del copyright.
  message?: string

  // El texto real de copyright.
  copyright?: string
}
```

La configuración anterior también admite cadenas HTML. Entonces, por ejemplo, si desea configurar el texto de su pie de página para que tenga algunos enlaces, puede ajustar la configuración de la siguiente manera:

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Publicado bajo <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">Licencia MIT</a>.',
      copyright: 'Derechos de autor © 2019-present <a href="https://github.com/yyx990803">Evan You</a>'
    }
  }
}
```

::: warning
Solo se utilizan elementos _inline_ será utilizado en `message` y `copyright` tal como se presenta dentro del elemento  `<p>`. Si desea agregar elementos de tipo _block_, considere usar un _slot_ [`layout-bottom`](../guide/extending-default-theme#layout-slots).
:::

Tenga en cuenta que el pie de página no se mostrará cuando la [Barra Lateral](./default-theme-sidebar) es visible.

## Configuración Frontmatter {#frontmatter-config}

Esto se puede desactivar por página usando la opción `footer` en frontmatter:

```yaml
---
footer: false
---
```
