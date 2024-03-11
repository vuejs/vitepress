# Última Atualização {#last-updated}

O tempo em que o conteúdo foi atualizado pela última vez será mostrado no canto inferior direito da página. Para habilitar, adicione a opção `lastUpdated` na sua configuração.

::: tip
Você precisa fazer _commit_ no arquivo markdown para ver o tempo atualizado.
:::

## Configuração a nível de Site {#site-level-config}

```js
export default {
  lastUpdated: true
}
```

## Configuração Frontmatter {#frontmatter-config}

Isso pode ser desabilitado por página usando a opção `lastUpdated` no frontmatter:

```yaml
---
lastUpdated: false
---
```

Refira-se ao [Tema Padrão: Última Atualização](./default-theme-config#lastupdated) para mais detalhes. Qualquer valor positivo a nível de tema também habilitará a funcionalidade a não ser que esteja explicitamente desabilitada a nível de página ou de site.
