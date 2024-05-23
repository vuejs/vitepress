# Editar Link {#edit-link}

## Configuração a nível de Site {#site-level-config}

Editar Link permite que você mostre um link para editar a página com serviços de gerenciamento Git, como GitHub ou GitLab. Para habilitar, adicione a opção `themeConfig.editLink` na sua configuração.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

A opção `pattern` define a estrutura da URL para o link, e `:path` será substituído com o mesmo caminho de página.

Você também pode colocar uma função pura que aceita [`PageData`](./runtime-api#usedata) como argumento e retorna uma URL em string.

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

Isso não deve gerar efeitos colaterais ou acessar qualquer coisa fora do seu escopo, uma vez que será serializado e executado no navegador.

Por padrão, isso irá adicionar o link com texto "Edite essa página" no final da página de documentação. Você pode personalizar esse texto ao definir a opção `text`.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edite essa página no GitHub'
    }
  }
}
```

## Configuração Frontmatter {#frontmatter-config}

A funcionalidade pode ser desabilitada por página usando a opção `editLink` no frontmatter:

```yaml
---
editLink: false
---
```
