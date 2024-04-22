# Links Anterior e Próximo {#prev-next-links}

Você pode personalizar o texto e o link para os botões de Anterior e Próximo mostrados ao fim da página. Isso é útil quando você quer mostrar um texto diferente daquele que você tem na barra lateral. Além disso, você pode achar útil desabilitar o rodapé ou link para a página para ela não ser incluída na sua barra lateral.

## prev

- Tipo: `string | false | { text?: string; link?: string }`

- Detalhes:

  Especifica o texto/link para mostrar no link para a página anterior. Se você não ver isso no frontmatter, o texto/link será inferido da configuração da barra lateral.

- Exemplos:

  - Para personalizar apenas o texto:

    ```yaml
    ---
    prev: 'Iniciar | Markdown'
    ---
    ```

  - Para personalizar ambos texto e link:

    ```yaml
    ---
    prev:
      text: 'Markdown'
      link: '/guide/markdown'
    ---
    ```

  - Para esconder a página anterior:

    ```yaml
    ---
    prev: false
    ---
    ```

## next

O mesmo que `prev` mas para a próxima página.
