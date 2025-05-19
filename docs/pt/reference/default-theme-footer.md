# Rodapé {#footer}

VitePress irá mostrar o rodapé global na parte inferior da página quando `themeConfig.footer` está presente.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Lançado sob Licença MIT.',
      copyright: 'Direitos Reservados © 2019-present Evan You'
    }
  }
}
```

```ts
export interface Footer {
  // A mensagem mostrada logo antes do copyright.
  message?: string

  // O próprio texto de copyright.
  copyright?: string
}
```

A configuração acima também suporta strings HTML. Então, por exemplo, se você quiser configurar o texto de rodapé para ter alguns links, você pode ajustar a configuração como o seguinte:

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Lançado sob <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">Licença MIT</a>.',
      copyright: 'Direitos Reservados © 2019-present <a href="https://github.com/yyx990803">Evan You</a>'
    }
  }
}
```

::: warning
Apenas elementos _inline_ serão usados em `message` e `copyright` conforme eles são apresentados dentro do elemento  `<p>`. Se você quiser adicionar elementos de tipo _block_, considere usar o _slot_ [`layout-bottom`](../guide/extending-default-theme#layout-slots).
:::

Note que o rodapé não será mostrado quando a [Barra Lateral](./default-theme-sidebar) estiver visível.

## Configuração Frontmatter {#frontmatter-config}

Isso pode ser desabilitado por página usando a opção `footer` em frontmatter:

```yaml
---
footer: false
---
```
