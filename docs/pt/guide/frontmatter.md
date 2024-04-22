# Frontmatter

## Utilização {#usage}

VitePress suporta frontmatter YAML em todos os arquivos Markdown, processando-os com [gray-matter](https://github.com/jonschlinkert/gray-matter). O frontmatter deve estar no topo do arquivo Markdown (antes de qualquer elemento, incluindo tags `<script>`), e deve ter a forma de um YAML válido entre linhas com traços triplos. Exemplo:

```md
---
title: Documentação com VitePress
editLink: true
---
```

Muitas opções de configuração do site ou do tema padrão têm opções correspondentes no frontmatter. Você pode usar o frontmatter para sobrepor um comportamento específico apenas para a página atual. Para mais detalhes, veja [Referência de Configuração do Frontmatter](../reference/frontmatter-config).

Você também pode definir dados próprios frontmatter personalizados, para serem usados em expressões Vue dinâmicas na página.

## Acesso aos Dados do Frontmatter {#accessing-frontmatter-data}

Os dados do frontmatter podem ser acessados por meio da variável global especial `$frontmatter`:

Aqui está um exemplo de como você poderia usá-lo em seu arquivo Markdown:

```md
---
title: Documentação com VitePress
editLink: true
---

# {{ $frontmatter.title }}

Conteúdo do guia
```

Você também pode acessar os dados do frontmatter da página atual em `<script setup>` com o auxiliar [`useData()`](../reference/runtime-api#usedata).

## Formatos Alternativos do Frontmatter {#alternative-frontmatter-formats}

VitePress também suporta a sintaxe frontmatter JSON, começando e terminando com chaves:

```json
---
{
  "title": "Criando blog como um hacker",
  "editLink": true
}
---
```
