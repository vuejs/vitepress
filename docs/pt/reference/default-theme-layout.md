# Layout {#layout}

Você pode escolher o layout da página definindo a opção de `layout` para o [frontmatter](./frontmatter-config) da página. Há três opções de layout: `doc`, `page` e `home`. Se nada for especificado, a página será tratada como página `doc`.

```yaml
---
layout: doc
---
```

## Layout do documento {#doc-layout}

A opção `doc` é o layout padrão e estiliza todo o conteúdo Markdown com o visual de "documentação". Ela funciona agrupando todo o conteúdo na classe CSS `vp-doc`, e aplicando os estilos aos elementos abaixo dela.

Quase todos os elementos genéricos, como `p` ou `h2`, recebem um estilo especial. Portanto, lembre-se de que se você adicionar qualquer HTML personalizado dentro de um conteúdo Markdown, ele também será afetado por esses estilos.

Ele também fornece recursos específicos de documentação listados abaixo. Esses recursos estão habilitados apenas neste layout.

- Editar link
- Links Anterior e Próximo
- _Outline_
- [Carbon Ads](./default-theme-carbon-ads)

## Layout da Página {#page-layout}

A opção `page` é tratada como "página em branco". O Markdown ainda será processado e todas as [Extensões Markdown](../guide/markdown) funcionarão da mesma forma que o layout `doc`, mas este não receberá nenhum estilo padrão.

O layout da página permitirá que você estilize tudo sem que o tema VitePress afete a marcação. Isso é útil quando você deseja criar sua própria página personalizada.

Observe que mesmo neste layout, a barra lateral ainda aparecerá se a página tiver uma configuração de barra lateral correspondente.

## Layout da Home {#home-layout}

A opção `home` gerará um modelo de _"Homepage"_. Nesse layout você pode definir opções extras, como `hero` e `features`, para personalizar ainda mais o conteúdo. Visite [Tema padrão: Página Inicial](./default-theme-home-page)  para obter mais detalhes.

## Sem Layout {#no-layout}

Se você não quiser nenhum layout, pode passar `layout: false` pelo frontmatter. Esta opção é útil se você deseja uma página de destino totalmente personalizável (sem barra lateral, barra de navegação ou rodapé por padrão).

## Layout Personalizado {#custom-layout}

Você também pode usar um layout personalizado:

```md
---
layout: foo
---
```

Isto irá procurar um componente chamado `foo` registrado no contexto. Por exemplo, você pode registrar seu componente globalmente em `.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import Foo from './Foo.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('foo', Foo)
  }
}
```
