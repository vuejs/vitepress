---
outline: deep
---

# Roteamento {#routing}

## Roteamento baseado em Arquivos {#file-based-routing}

VitePress utiliza roteamento baseado em arquivos, isso significa que as páginas HTML geradas são mapeadas da estrutura de diretórios dos arquivos fonte Markdown. Por exemplo, dada a seguinte estrutura de diretório:

```
.
├─ guide
│  ├─ getting-started.md
│  └─ index.md
├─ index.md
└─ prologue.md
```

As páginas HTML geradas serão:

```
index.md                  -->  /index.html (acessível por /)
prologue.md                -->  /prologue.html
guide/index.md             -->  /guide/index.html (acessível por /guide/)
guide/getting-started.md  -->  /guide/getting-started.html
```

O HTML resultante pode ser hospedado em qualquer servidor web que possa servir arquivos estáticos.

## Diretório Raiz e Fonte {#root-and-source-directory}

Existem dois conceitos importantes na estrutura de arquivos de um projeto VitePress: o **diretório raiz** e o **diretório fonte**.

### Diretório Raiz {#project-root}

O diretório raiz é onde o VitePress procura pelo diretório especial `.vitepress`. O diretório `.vitepress` é um local reservado para o arquivo de configuração do VitePress, o cache do servidor de desenvolvimento, o resultado da compilação e o código de personalização de tema opcional.

Ao executar `vitepress dev` ou `vitepress build` no terminal, VitePress usará o diretório atual como diretório raiz do projeto. Para especificar um subdiretório como raiz, é necessário passar o caminho relativo para o comando. Por exemplo, se o projeto VitePress estiver localizado em `./docs`, deve-se executar `vitepress dev docs`:

```
.
├─ docs                    # diretório raiz
│  ├─ .vitepress           # diretório de configuração
│  ├─ getting-started.md
│  └─ index.md
└─ ...
```

```sh
vitepress dev docs
```

Isso resultará no seguinte mapeamento da fonte para HTML:

```
docs/index.md            -->  /index.html (acessível como /)
docs/getting-started.md  -->  /getting-started.html
```

### Diretório Fonte {#source-directory}

O diretório fonte é onde seus arquivos fonte em Markdown estão. Por padrão, é o mesmo que o diretório raiz. No entanto, você pode configurá-lo por meio da opção de configuração [`srcDir`](../reference/site-config#srcdir).

A opção `srcDir` é resolvida em relação ao diretório raiz do projeto. Por exemplo, com `srcDir: 'src'`, sua estrutura de arquivos ficará assim:

```
.                          # diretório raiz
├─ .vitepress              # diretório de configuração
└─ src                     # diretório fonte
   ├─ getting-started.md
   └─ index.md
```

O mapeamento resultante da fonte para HTML:

```
src/index.md            -->  /index.html (acessível como /)
src/getting-started.md  -->  /getting-started.html
```

## Links Entre Páginas {#linking-between-pages}

Você pode usar tanto caminhos absolutos quanto relativos ao vincular páginas. Note que, embora ambas as extensões `.md` e `.html` funcionem, a prática recomendada é omitir as extensões de arquivo para que o VitePress possa gerar as URLs finais com base na sua configuração.

```md
<!-- Fazer -->
[Getting Started](./getting-started)
[Getting Started](../guide/getting-started)

<!-- Não Fazer -->
[Getting Started](./getting-started.md)
[Getting Started](./getting-started.html)
```

Saiba mais sobre a vinculação de ativos, como imagens, em [Manipulação de Ativos](./asset-handling).

### Vinculação a Páginas Não VitePress {#linking-to-non-vitepress-pages}

Se você deseja vincular a uma página em seu site que não é gerada pelo VitePress, será necessário usar a URL completa (abre em uma nova guia) ou especificar explicitamente o destino:

**Entrada**

```md
[Link para pure.html](/pure.html){target="_self"}
```

**Saída**

[Link para pure.html](/pure.html){target="_self"}

::: tip Nota

Nos links Markdown, a `base` é automaticamente adicionada à URL. Isso significa que, se você deseja vincular a uma página fora da sua base, será necessário algo como `../../pure.html` no link (resolvido em relação à página atual pelo navegador).

Alternativamente, pode-se usar diretamente a sintaxe da tag âncora:

```md
<a href="/pure.html" target="_self">Link para pure.html</a>
```

:::

## Geração de URL Limpa {#generating-clean-url}

::: warning Suporte do Servidor Necessário
Para servir URLs limpas com VitePress, é necessário suporte no lado do servidor.
:::

Por padrão, VitePress resolve links de entrada para URLs que terminam com `.html`. No entanto, alguns usuários podem preferir "URLs limpas" sem a extensão `.html`, por exemplo, `example.com/caminho` em vez de `example.com/caminho.html`.

Alguns servidores ou plataformas de hospedagem (por exemplo, Netlify, Vercel, GitHub Pages) fornecem a habilidade de mapear uma URL como `/foo` para `/foo.html` se ela existir, sem redirecionamento:

- Netlify e GitHub Pages suportam isso por padrão.
- Vercel requer a ativação da opção [`cleanUrls` no `vercel.json`](https://vercel.com/docs/concepts/projects/project-configuration#cleanurls).

Se essa funcionalidade estiver disponível para você, também se pode ativar a própria opção de configuração [`cleanUrls`](../reference/site-config#cleanurls) de VitePress para que:

- Links de entrada entre páginas sejam gerados sem a extensão `.html`.
- Se o caminho atual terminar com `.html`, o roteador realizará um redirecionamento no lado do cliente para o caminho sem extensão.

No entanto, se você não puder configurar o servidor com esse suporte, será necessário recorrer manualmente à seguinte estrutura de diretório:

```
.
├─ getting-started
│  └─ index.md
├─ installation
│  └─ index.md
└─ index.md
```
# Reescrita de Rota {#route-rewrites}

Você pode personalizar o mapeamento entre a estrutura de diretórios fonte e as páginas geradas. Isso é útil quando você tem uma estrutura de projeto complexa. Por exemplo, digamos que você tenha um monorepo com vários pacotes e gostaria de colocar as documentações junto com os arquivos fonte desta forma:

```
.
├─ packages
│  ├─ pkg-a
│  │  └─ src
│  │      ├─ pkg-a-code.ts
│  │      └─ pkg-a-docs.md
│  └─ pkg-b
│     └─ src
│         ├─ pkg-b-code.ts
│         └─ pkg-b-docs.md
```

E você deseja que as páginas VitePress sejam geradas assim:

```
packages/pkg-a/src/pkg-a-docs.md  -->  /pkg-a/index.html
packages/pkg-b/src/pkg-b-docs.md  -->  /pkg-b/index.html
```

Você pode realizar isso configurando a opção [`rewrites`](../reference/site-config#rewrites) assim:

```ts [.vitepress/config.js]
export default {
  rewrites: {
    'packages/pkg-a/src/pkg-a-docs.md': 'pkg-a/index.md',
    'packages/pkg-b/src/pkg-b-docs.md': 'pkg-b/index.md'
  }
}
```

A opção `rewrites` também suporta parâmetros de rota dinâmicos. No exemplo acima, seria verboso listar todos os caminhos se você tiver muitos pacotes. Dado que todos eles têm a mesma estrutura de arquivo, você pode simplificar a configuração assim:

```ts
export default {
  rewrites: {
    'packages/:pkg/src/(.*)': ':pkg/index.md'
  }
}
```

Os caminhos de reescrita são compilados usando o pacote `path-to-regexp` - consulte [sua documentação](https://github.com/pillarjs/path-to-regexp#parameters) para uma sintaxe mais avançada.

::: warning Links Relativos com Reescritas

Quando as reescritas estão habilitadas, **links relativos devem ser baseados nos caminhos reescritos**. Por exemplo, para criar um link relativo de `packages/pkg-a/src/pkg-a-code.md` para `packages/pkg-b/src/pkg-b-code.md`, deve-se usar:

```md
[Link para PKG B](../pkg-b/pkg-b-code)
```
:::

## Rotas Dinâmicas {#dynamic-routes}

Você pode gerar muitas páginas usando um único arquivo Markdown e dados dinâmicos. Por exemplo, você pode criar um arquivo `packages/[pkg].md` que gera uma página correspondente para cada pacote em um projeto. Aqui, o segmento `[pkg]` é um **parâmetro** de rota que diferencia cada página das outras.

### Arquivo de Carregamento de Caminhos {#paths-loader-file}

Como VitePress é um gerador de site estático, os caminhos possíveis das páginas devem ser determinados no momento da compilação. Portanto, uma página de rota dinâmica **deve** ser acompanhada por um **arquivo de carregamento de caminhos**. Para `packages/[pkg].md`, precisaremos de `packages/[pkg].paths.js` (`.ts` também é suportado):

```
.
└─ packages
   ├─ [pkg].md         # modelo de rota
   └─ [pkg].paths.js   # carregador de caminhos da rota
```

O carregador de caminhos deve fornecer um objeto com um método `paths` como sua exportação padrão. O método `paths` deve retornar um _array_ de objetos com uma propriedade `params`. Cada um desses objetos gerará uma página correspondente.

Dado o seguinte _array_ `paths`:

```js
// packages/[pkg].paths.js
export default {
  paths() {
    return [
      { params: { pkg: 'foo' }},
      { params: { pkg: 'bar' }}
    ]
  }
}
```

As páginas HTML geradas serão:

```
.
└─ packages
   ├─ foo.html
   └─ bar.html
```

### Múltiplos Parâmetros {#multiple-params}

Uma rota dinâmica pode conter múltiplos parâmetros:

**Estrutura de Arquivo**

```
.
└─ packages
   ├─ [pkg]-[version].md
   └─ [pkg]-[version].paths.js
```

**Carregador de Caminhos**

```js
export default {
  paths: () => [
    { params: { pkg: 'foo', version: '1.0.0' }},
    { params: { pkg: 'foo', version: '2.0.0' }},
    { params: { pkg: 'bar', version: '1.0.0' }},
    { params: { pkg: 'bar', version: '2.0.0' }}
  ]
}
```

**Saída**

```
.
└─ packages
   ├─ foo-1.0.0.html
   ├─ foo-2.0.0.html
   ├─ bar-1.0.0.html
   └─ bar-2.0.0.html
```

### Gerando Caminhos Dinamicamente {#dynamically-generating-paths}

O módulo de carregamento de caminhos é executado no Node.js e apenas durante o momento de compilação. Você pode gerar dinamicamente o _array_ de caminhos usando qualquer dado, seja local ou remoto.

Gerando caminhos a partir de arquivos locais:

```js
import fs from 'fs'

export default {
  paths() {
    return fs
      .readdirSync('packages')
      .map((pkg) => {
        return { params: { pkg }}
      })
  }
}
```

Gerando caminhos a partir de dados remotos:

```js
export default {
  async paths() {
    const pkgs = await (await fetch('https://my-api.com/packages')).json()

    return pkgs.map((pkg) => {
      return {
        params: {
          pkg: pkg.name,
          version: pkg.version
        }
      }
    })
  }
}
```

### Acessando Parâmetros na Página {#accessing-params-in-page}

Você pode usar os parâmetros para passar dados adicionais para cada página. O arquivo de rota Markdown pode acessar os parâmetros da página atual em expressões Vue através da propriedade global `$params`:

```md
- nome do pacote: {{ $params.pkg }}
- versão: {{ $params.version }}
```

Você também pode acessar os parâmetros da página atual através da API de tempo de execução [`useData`](../reference/runtime-api#usedata). Isso está disponível tanto em arquivos Markdown quanto em componentes Vue:

```vue
<script setup>
import { useData } from 'vitepress'

// params é uma ref Vue
const { params } = useData()

console.log(params.value)
</script>
```

### Apresentando Conteúdo Cru {#rendering-raw-content}

Parâmetros passados para a página serão serializados na carga JavaScript do cliente, portanto, evite passar dados pesados nos parâmetros, como Markdown cru ou conteúdo HTML obtido de um CMS remoto.

Em vez disso, você pode passar tal conteúdo para cada página usando a propriedade `content` em cada objeto de caminho:

```js
export default {
  async paths() {
    const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

    return posts.map((post) => {
      return {
        params: { id: post.id },
        content: post.content // Markdown ou HTML cru
      }
    })
  }
}
```

Em seguida, use a seguinte sintaxe especial para apresentar o conteúdo como parte do próprio arquivo Markdown:

```md
<!-- @content -->
```
