# Extensões Markdown {#markdown-extensions}

VitePress vem com Extensões Markdown embutidas.

## Âncoras de Cabeçalho {#header-anchors}

Cabeçalhos recebem a aplicação automaticamente de links âncora. A apresentação das âncoras pode ser configurada usando a opção `markdown.anchor`.

### Âncoras personalizadas {#custom-anchors}

Para especificar uma _tag_ âncora personalizada para um cabeçalho em vez de usar aquela gerada automaticamente, adicione um sufixo ao cabeçalho:

```
# Usando âncoras personalizadas {#minha-ancora}
```

Isso permite que você tenha um link do cabeçalho como `#minha-ancora` em vez do padrão `#usando-ancoras-personalizadas`.

## Links {#links}

Ambos os links internos e externos recebem tratamento especial.

### Links Internos {#internal-links}

Os links internos são convertidos em links de roteador para navegação SPA. Além disso, todo arquivo `index.md` contido em cada subdiretório será automaticamente convertido para `index.html`, com a URL correspondente `/`.

Por exemplo, dada a seguinte estrutura de diretórios:

```
.
├─ index.md
├─ foo
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ bar
   ├─ index.md
   ├─ three.md
   └─ four.md
```

E supondo que você esteja em `foo/one.md`:

```md
[Página Inicial](/) <!-- leva o usuário ao index.md raiz -->
[foo](/foo/) <!-- leva o usuário ao index.html do diretório foo -->
[foo heading](./#heading) <!-- ancora o usuário a um cabeçalho do arquivo índice foo -->
[bar - three](../bar/three) <!-- você pode omitir a extensão -->
[bar - three](../bar/three.md) <!-- você pode adicionar .md -->
[bar - four](../bar/four.html) <!-- ou você pode adicionar .html -->
```

### Sufixo de Página {#page-suffix}

Páginas e links internos são gerados com o sufixo `.html` por padrão.

### Links Externos {#external-links}

Links externos recebem automaticamente `target="_blank" rel="noreferrer"`:

- [vuejs.org](https://vuejs.org)
- [VitePress no GitHub](https://github.com/vuejs/vitepress)

## Frontmatter {#frontmatter}

[YAML frontmatter](https://jekyllrb.com/docs/front-matter/) é suportado por padrão:

```yaml
---
título: Escrevendo como um Hacker
idioma: pt-BR
---
```

Esses dados estarão disponíveis para o restante da página, junto com todos os componentes personalizados e de temas.

Para mais detalhes, veja [Frontmatter](../reference/frontmatter-config).

## Tabelas ao Estilo GitHub {#github-style-tables}

**Entrada**

```md
| Tabelas       |    São        |  Legais |
| ------------- | :-----------: |   ----: |
| col 3 está    | à direita     |   $1600 |
| col 2 está    | centralizada  |     $12 |
| listras       |   são legais  |      $1 |
```

**Saída**

| Tabelas       |    São        |   Legais |
| ------------- | :-----------: |   -----: |
| col 3 está    | à direita     |   \$1600 |
| col 2 está    | centralizada  |     \$12 |
| listras       |   são legais  |      \$1 |

## Emoji :tada:

**Entrada**

```
:tada: :100:
```

**Saída**

:tada: :100:

Uma [lista de todos os emojis](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.mjs) está disponível.

## Tabela de Conteúdo (TOC)

**Entrada**

```
[[toc]]
```

**Saída**

[[toc]]

A apresentação de TOC (Table of Contents) pode ser configurada usando a opção `markdown.toc`.

## Recipientes Personalizados {#custom-containers}

Recipientes personalizados podem ser definidos por seus tipos, títulos e conteúdos.

### Título Padrão {#default-title}

**Entrada**

```md
::: info
Este é um bloco de informações.
:::

::: tip
Este é um aviso.
:::

::: warning
Este é um aviso.
:::

::: danger
Este é um aviso de perigo.
:::

::: details
Este é um bloco de detalhes.
:::
```

**Saída**

::: info
Este é um bloco de informações.
:::

::: tip
Este é um aviso.
:::

::: warning
Este é um aviso.
:::

::: danger
Este é um aviso de perigo.
:::

::: details
Este é um bloco de detalhes.
:::

### Título Personalizado {#custom-title}

Você pode definir um título personalizado adicionando o texto imediatamente após o "tipo" do recipiente.

**Entrada**

````md
::: danger STOP
Zona de perigo, não prossiga
:::

::: details Clique para ver o código
```js
console.log('Olá, VitePress!')
```
:::
````

**Saída**

::: danger STOP
Zona de perigo, não prossiga
:::

::: details Clique para ver o código
```js
console.log('Olá, VitePress!')
```
:::

Além disso, você pode definir títulos personalizados globalmente adicionando o seguinte conteúdo no arquivo de configuração do site, útil se não estiver escrevendo em inglês:

```ts
// config.ts
export default defineConfig({
  // ...
  markdown: {
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    }
  }
  // ...
})
```

### `raw`

Este é um recipiente especial que pode ser usado para evitar conflitos de estilo e roteador com VitePress. Isso é especialmente útil ao documentar bibliotecas de componentes. Você também pode verificar [whyframe](https://whyframe.dev/docs/integrations/vitepress) para melhor isolamento.

**Sintaxe**

```md
::: raw
Envolve em um `<div class="vp-raw">`
:::
```

A classe `vp-raw` também pode ser usada diretamente em elementos. O isolamento de estilo é atualmente opcional:

- Instale o `postcss` com seu gerenciador de pacotes preferido:

  ```sh
  $ npm add -D postcss
  ```

- Crie um arquivo chamado `docs/postcss.config.mjs` e adicione o seguinte:

  ```js
  import { postcssIsolateStyles } from 'vitepress'

  export default {
    plugins: [postcssIsolateStyles()]
  }
  ```

  Ele utiliza [`postcss-prefix-selector`](https://github.com/postcss/postcss-load-config) internamente. Você pode passar opções assim:

  ```js
  postcssIsolateStyles({
    includeFiles: [/vp-doc\.css/] // o padrão é /base\.css/
  })
  ```

## Alertas no estilo GitHub {#github-flavored-alerts}

VitePress também suporta [alertas no estilo GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts) para apresentar como um bloco de chamada. Eles serão apresentados da mesma forma que [elementos personalizados](#custom-containers).

```md
> [!NOTE]
> Destaca informações que os usuários devem levar em consideração, mesmo ao ler rapidamente.

> [!TIP]
> Informações opcionais para ajudar o usuário a ter mais sucesso.

> [!IMPORTANT]
> Informações cruciais necessárias para que os usuários tenham sucesso.

> [!WARNING]
> Conteúdo crítico exigindo atenção imediata do usuário devido a riscos potenciais.

> [!CAUTION]
> Potenciais consequências negativas de uma ação.
```

> [!NOTE]
> Destaca informações que os usuários devem levar em consideração, mesmo ao ler rapidamente.

> [!TIP]
> Informações opcionais para ajudar o usuário a ter mais sucesso.

> [!IMPORTANT]
> Informações cruciais necessárias para que os usuários tenham sucesso.

> [!WARNING]
> Conteúdo crítico exigindo atenção imediata do usuário devido a riscos potenciais.

> [!CAUTION]
> Potenciais consequências negativas de uma ação.

## Destaque de Sintaxe em Blocos de Código {#syntax-highlighting-in-code-blocks}

VitePress utiliza [Shiki](https://github.com/shikijs/shiki) para destacar a sintaxe da linguagem em blocos de código Markdown, usando texto colorido. Shiki suporta uma ampla variedade de linguagens de programação. Tudo o que você precisa fazer é adicionar um _alias_ de linguagem válido após os crases iniciais do bloco de código:

**Entrada**

````
```js
export default {
  name: 'MyComponent',
  // ...
}
```
````

````
```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```
````

**Saída**

```js
export default {
  name: 'MyComponent'
  // ...
}
```

```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```

Uma [lista de linguagens válidas](https://shiki.style/languages) está disponível no repositório Shiki.

Você também pode personalizar o tema de destaque de sintaxe na configuração do aplicativo. Consulte as [opções `markdown`](../reference/site-config#markdown) para mais detalhes.

## Destaque de Linha em Blocos de Código {#line-highlighting-in-code-blocks}

**Entrada**

````
```js{4}
export default {
  data () {
    return {
      msg: 'Destacado!'
    }
  }
}
```
````

**Saída**

```js{4}
export default {
  data () {
    return {
      msg: 'Destacado!'
    }
  }
}
```

Além de uma única linha, você também pode especificar múltiplas linhas únicas, intervalos, ou ambos:

- Intervalos de linha: por exemplo, `{5-8}`, `{3-10}`, `{10-17}`
- Múltiplas linhas únicas: por exemplo, `{4,7,9}`
- Intervalos de linha e linhas únicas: por exemplo, `{4,7-13,16,23-27,40}`

**Entrada**

````
```js{1,4,6-8}
export default { // Destacado
  data () {
    return {
      msg: `Destacado!
      Esta linha não está destacada,
      mas esta e as próximas 2 estão.`,
      motd: 'VitePress é incrível',
      lorem: 'ipsum'
    }
  }
}
```
````

**Saída**

```js{1,4,6-8}
export default { // Destacado
  data () {
    return {
      msg: `Destacado!
      Esta linha não está destacada,
      mas esta e as próximas 2 estão.`,
      motd: 'VitePress é incrível',
      lorem: 'ipsum',
    }
  }
}
```

Alternativamente, é possível destacar diretamente na linha usando o comentário `// [!code highlight]`.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: 'Destacado!' // [!!code highlight]
    }
  }
}
```
````

**Saída**

```js
export default {
  data() {
    return {
      msg: 'Destacado!' // [!code destaque]
    }
  }
}
```

## Foco em Blocos de Código {#focus-in-code-blocks}

Adicionando o comentário `// [!code focus]` em uma linha irá destacá-la e desfocar as outras partes do código.

Além disso, você pode definir o número de linhas para focar usando `// [!code focus:<linhas>]`.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: 'Focado!' // [!!code focus]
    }
  }
}
```
````

**Saída**

```js
export default {
  data() {
    return {
      msg: 'Focado!' // [!code focus]
    }
  }
}
```

## Diferenças Coloridas em Blocos de Código {#colored-diffs-in-code-blocks}

Adicionar os comentários `// [!code --]` ou `// [!code ++]` em uma linha criará uma diferença nessa linha, mantendo as cores do bloco de código.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: 'Removido' // [!!code --]
      msg: 'Adicionado' // [!!code ++]
    }
  }
}
```
````

**Saída**

```js
export default {
  data () {
    return {
      msg: 'Removido' // [!code --]
      msg: 'Adicionado' // [!code ++]
    }
  }
}
```

## Erros e Avisos em Blocos de Código {#errors-and-warnings-in-code-blocks}

Adicionar os comentários `// [!code warning]` ou `// [!code error]` em uma linha colorirá os blocos conforme apropriado.

**Entrada**

````
```js
export default {
  data () {
    return {
      msg: 'Erro', // [!!code error]
      msg: 'Aviso' // [!!code warning]
    }
  }
}
```
````

**Saída**

```js
export default {
  data() {
    return {
      msg: 'Erro', // [!code error]
      msg: 'Aviso' // [!code warning]
    }
  }
}
```

## Números de Linha {#line-numbers}

Você pode habilitar números de linha para cada bloco de código através do arquivo de configuração:

```js
export default {
  markdown: {
    lineNumbers: true
  }
}
```

Consulte as [opções markdown](../reference/site-config#markdown) para mais detalhes.

Você pode adicionar a marca `:line-numbers` / `:no-line-numbers` em seus blocos de código para substituir o valor definido na configuração.

Você também pode personalizar o número inicial da linha adicionando `=` após `:line-numbers`. Por exemplo, `:line-numbers=2` significa que os números das linhas nos blocos de código começarão a partir de `2`.

**Entrada**

````md
```ts {1}
// números de linha desativados por padrão
const line2 = 'Esta é a linha 2'
const line3 = 'Esta é a linha 3'
```

```ts:line-numbers {1}
// números de linha ativados
const line2 = 'Esta é a linha 2'
const line3 = 'Esta é a linha 3'
```

```ts:line-numbers=2 {1}
// números de linha ativados e começam do 2
const line3 = 'Esta é a linha 3'
const line4 = 'Esta é a linha 4'
```
````

**Saída**

```ts {1}
// números de linha desativados por padrão
const line2 = 'Esta é a linha 2'
const line3 = 'Esta é a linha 3'
```

```ts:line-numbers {1}
// números de linha ativados
const line2 = 'Esta é a linha 2'
const line3 = 'Esta é a linha 3'
```

```ts:line-numbers=2 {1}
// números de linha ativados e começam do 2
const line3 = 'Esta é a linha 3'
const line4 = 'Esta é a linha 4'
```

## Importar _Snippets_ de Código {#import-code-snippets}

Você pode importar trechos de código de arquivos existentes usando a seguinte sintaxe:

```md
<<< @/filepath
```

Também suporta [destaque de linha](#line-highlighting-in-code-blocks):

```md
<<< @/filepath{highlightLines}
```

**Entrada**

```md
<<< @/snippets/snippet.js{2}
```

**Arquivo de Código**

<<< @/snippets/snippet.js

**Saída**

<<< @/snippets/snippet.js{2}

::: tip
O valor de `@` corresponde à raiz do código fonte. Por padrão, é a raiz do projeto VitePress, a menos que `srcDir` seja configurado. Alternativamente, você também pode importar de caminhos relativos:

```md
<<< ../snippets/snippet.js
```

:::

Você também pode usar uma [região VS Code](https://code.visualstudio.com/docs/editor/codebasics#_folding) para incluir apenas a parte correspondente do arquivo de código. Você pode fornecer um nome de região personalizado após um `#` seguindo o caminho do arquivo:

**Entrada**

```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

**Arquivo de Código**

<<< @/snippets/snippet-with-region.js

**Saída**

<<< @/snippets/snippet-with-region.js#snippet{1}

Você também pode especificar o idioma dentro das chaves (`{}`), assim:

```md
<<< @/snippets/snippet.cs{c#}

<!-- com destaque de linha: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#}

<!-- com números de linha: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#:line-numbers}
```

Isso é útil se a linguagem original não puder ser inferida pela extensão do arquivo.

## Grupos de Código {#code-groups}

Você pode agrupar vários blocos de código assim:

**Entrada**

````md
::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```

:::
````

**Saída**

::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```

:::

Você também pode [importar _snippets_ de código](#import-code-snippets) em grupos de código:

**Entrada**

```md
::: code-group

<!-- nome de arquivo usado como título por padrão -->

<<< @/snippets/snippet.js

<!-- você pode fornecer um personalizado também -->

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::
```

**Output**

::: code-group

<<< @/snippets/snippet.js

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::

## Inclusão de Arquivo Markdown {#markdown-file-inclusion}

Você pode incluir um arquivo markdown em outro arquivo markdown, mesmo aninhado.

::: tip
Você também pode prefixar o caminho do markdown com `@`, ele atuará como a raiz de origem. Por padrão, é a raiz do projeto VitePress, a menos que `srcDir` seja configurado.
:::

Por exemplo, você pode incluir um arquivo markdown relativo usando isto:

**Entrada**

```md
# Documentação

## Conceitos Básicos

<!--@include: ./parts/basics.md-->
```

**Arquivo da Parte** (`parts/basics.md`)

```md
Algumas coisas básicas.

### Configuração

Pode ser criada usando `.foorc.json`.
```

**Código Equivalente**

```md
# Documentação

## Conceitos Básicos

Algumas coisas básicas.

### Configuração

Pode ser criada usando `.foorc.json`.
```

Também suporta a seleção de um intervalo de linhas:

**Entrada**

```md
# Documentação

## Conceitos Básicos

<!--@include: ./parts/basics.md{3,}-->
```

**Arquivo da Parte** (`parts/basics.md`)

```md
Algumas coisas básicas.

### Configuração

Pode ser criada usando `.foorc.json`.
```

**Código Equivalente**

```md
# Documentação

## Conceitos Básicos

### Configuração

Pode ser criada usando `.foorc.json`.
```

O formato do intervalo de linhas selecionado pode ser: `{3,}`, `{,10}`, `{1,10}`

::: warning
Observe que isso não gera erros se o arquivo não estiver presente. Portanto, ao usar esse recurso, certifique-se de que o conteúdo está sendo mostrado como esperado.
:::

## Equações Matemáticas {#math-equations}

Isso é atualmente opcional. Para ativá-lo, você precisa instalar `markdown-it-mathjax3` e definir `markdown.math` como `true` no seu arquivo de configuração:

```sh
npm add -D markdown-it-mathjax3
```

```ts [.vitepress/config.ts]
export default {
  markdown: {
    math: true
  }
}
```

**Entrada**

```md
Quando $a \ne 0$, existem duas soluções para $(ax^2 + bx + c = 0)$ e elas são
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Equações de Maxwell:**

| equação                                                                                                                                                                  | descrição                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | a divergência de $\vec{\mathbf{B}}$ é zero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | a rotacional de $\vec{\mathbf{E}}$ é proporcional à taxa de variação de $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _hã?_                                                                                     |

**Saída**

Quando $a \ne 0$, existem duas soluções para $(ax^2 + bx + c = 0)$ e são
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Equações de Maxwell:**

| equação                                                                                                                                                                  | descrição                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | a divergência de $\vec{\mathbf{B}}$ é zero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | a rotacional de $\vec{\mathbf{E}}$ é proporcional à taxa de variação de $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _hã?_                                                                                     |

## _Lazy Loading_ de Imagens {#image-lazy-loading}

Você pode ativar o "carregamento folgado" para cada imagem adicionada via markdown definindo `lazyLoading` como `true` no seu arquivo de configuração:

```js
export default {
  markdown: {
    image: {
      // o carregamento folgado de imagens está desativado por padrão
      lazyLoading: true
    }
  }
}
```

## Configuração Avançada {#advanced-configuration}

VitePress usa [markdown-it](https://github.com/markdown-it/markdown-it) como interpretador Markdown. Muitas das extensões acima são implementadas por meio de _plugins_ personalizados. Você pode personalizar ainda mais a instância `markdown-it` usando a opção `markdown` em `.vitepress/config.js`:

```js
import { defineConfig } from 'vitepress'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFoo from 'markdown-it-foo'

export default defineConfig({
  markdown: {
    // opções para markdown-it-anchor
    // https://github.com/valeriangalliat/markdown-it-anchor#usage
    anchor: {
      permalink: markdownItAnchor.permalink.headerLink()
    },

    // opções para @mdit-vue/plugin-toc
    // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
    toc: { level: [1, 2] },

    config: (md) => {
      // use mais plugins markdown-it!
      md.use(markdownItFoo)
    }
  }
})
```

Consulte a lista completa de propriedades configuráveis em [Referência de Configuração: Configuração da Aplicação](../reference/site-config#markdown).
