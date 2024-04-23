# Navegação {#nav}

Referente a barra de navegação exibida no topo da página. Ela contém o título do site, links do menu global, e etc.

## Título do Site e Logo {#site-title-and-logo}

Por padrão, a navegação mostra o título do site referenciando o valor de [`config.title`](./site-config#title). Se desejar alterar o que é exibido na navegação, você pode definir um texto personalizado na opção `themeConfig.siteTitle`.

```js
export default {
  themeConfig: {
    siteTitle: 'Meu Título Personalizado'
  }
}
```

Se você tiver um logo para seu site, pode mostrá-lo passando o caminho para a imagem. Você deve colocar o logo diretamente dentro da pasta `public`, e definir o caminho absoluto para ele.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

Ao adicionar um logo, ele é mostrado juntamente com o título do site. Se seu logo tem tudo o que você precisa e se você desejar ocultar o texto do título, defina `false` na opção `siteTitle`.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

Você também pode passar um objeto como logo se quiser adicionar um atributo `alt` ou personalizá-lo com base no modo claro/escuro. Consulte [`themeConfig.logo`](./default-theme-config#logo) para obter detalhes.

## Links de Navegação {#navigation-links}

Você pode definir a opção `themeConfig.nav` para adicionar links à sua navegação.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guia', link: '/guide' },
      { text: 'Configuração', link: '/config' },
      { text: 'Registro de Alterações', link: 'https://github.com/...' }
    ]
  }
}
```

`text` é o próprio texto mostrado na navegação, e o `link` é o link para o qual será navegado quando o texto for clicado. Para o link, defina o caminho para o próprio arquivo sem o prefixo `.md` e sempre comece com `/`.

Links de navegação também podem ser menus _dropdown_. Para fazer isso, defina a chave `items` na opção do link.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guia', link: '/guide' },
      {
        text: 'Menu Dropdown',
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

Note que o título do menu _dropdown_ (`Menu Dropdown` no exemplo acima) não pode ter a propriedade `link`, pois ele se torna um botão para abrir o diálogo dropdown.

Você também pode adicionar "seções" aos itens do menu _dropdown_ passando mais itens aninhados.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guia', link: '/guia' },
      {
        text: 'Menu Dropdown',
        items: [
          {
            // Título da seção.
            text: 'Título da Seção A',
            items: [
              { text: 'Item A da Seção A', link: '...' },
              { text: 'Item B da Seção B', link: '...' }
            ]
          }
        ]
      },
      {
        text: 'Menu Dropdown',
        items: [
          {
            // Você também pode omitir o título.
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

### Personalizar o estado "ativo" do link {#customize-link-s-active-state}

Os itens do menu de navegação serão destacados quando a página atual estiver no caminho correspondente. Se desejar personalizar o caminho a ser correspondido, defina a propriedade `activeMatch` e regex como um valor em string.

```js
export default {
  themeConfig: {
    nav: [
      // Este link fica no estado ativo quando
      // o usuário está no caminho `/config/`.
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
`activeMatch` deve ser uma string regex, mas você deve defini-la como uma string. Não podemos usar um objeto RegExp real aqui porque ele não é serializável durante o momento de construção.
:::

### Personalizar os atributos "target" e "rel" de links {#customize-link-s-target-and-rel-attributes}

Por padrão, VitePress determina automaticamente os atributos `target` e `rel` baseado em um link externo ou não. Mas se você quiser, também pode personalizá-los.

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

## Links Sociais {#social-links}

Consulte [`socialLinks`](./default-theme-config#sociallinks).
