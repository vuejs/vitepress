---
description: Configura el pie de página global que se muestra en la parte inferior de las páginas de VitePress.
---

# Pie de página {#footer}

VitePress mostrará un pie de página global en la parte inferior de la página cuando `themeConfig.footer` está presente.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Liberado bajo la licencia MIT',
      copyright: 'Todos los derechos reservados © 2019-PRESENTE Evan You'
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

La configuración anterior también admite cadenas HTML. Entonces, por ejemplo, si desea configurar el texto del pie de página para que contenga algunos enlaces, puede ajustar la configuración de la siguiente manera:

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Liberado bajo <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">Licencia MIT</a>.',
      copyright: 'Todos los derechos reservados © 2019-PRESENTE <a href="https://github.com/yyx990803">Evan You</a>'
    }
  }
}
```

::: warning
Solo se pueden usar elementos _inline_ en `message` y `copyright`, ya que se renderizan dentro de un elemento `<p>`. Si desea agregar elementos _block_, considere usar un _slot_ [`layout-bottom`](../guide/extending-default-theme#layout-slots).
:::

Tenga en cuenta que el pie de página no se mostrará cuando la [Barra Lateral](./default-theme-sidebar) es visible.

## Configuración Frontmatter {#frontmatter-config}

Esto se puede desactivar por página usando la opción `footer` en frontmatter:

```yaml
---
footer: false
---
```
