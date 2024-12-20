# Iniciando {#getting-started}

## Experimente Online {#try-it-online}

Você pode experimentar VitePress diretamente no seu navegador em [StackBlitz](https://vitepress.new).

## Instalação {#installation}

### Pré-requisitos {#prerequisites}

- [Node.js](https://nodejs.org/) na versão 18 ou superior.
- Terminal para acessar VitePress através da sua interface de linha de comando (CLI).
- Editor de texto com suporte a sintaxe [Markdown](https://en.wikipedia.org/wiki/Markdown).
  - [VSCode](https://code.visualstudio.com/) é recomendado, junto com a [extensão oficial Vue](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

VitePress pode ser usado sozinho, ou ser instalado em um projeto já existente. Em ambos os casos, você pode instalá-lo com:

::: code-group

```sh [npm]
$ npm add -D vitepress
```

```sh [pnpm]
$ pnpm add -D vitepress
```

```sh [yarn]
$ yarn add -D vitepress
```

```sh [yarn (pnp)]
$ yarn add -D vitepress vue
```

```sh [bun]
$ bun add -D vitepress
```

:::

::: details Está recebendo avisos sobre dependências correspondentes ausentes?
Se usar PNPM, você perceberá um aviso de ausência de `@docsearch/js`. Isso não evita que o VitePress funcione. Se você deseja suprimir este aviso, adicione o seguinte no seu `package.json`:

```json
"pnpm": {
  "peerDependencyRules": {
    "ignoreMissing": [
      "@algolia/client-search",
      "search-insights"
    ]
  }
}
```

:::

::: tip NOTA

VitePress é um pacote apenas para ESM. Não use `require()` para importá-lo, e certifique de que o `package.json` mais próximo contém `"type": "module"`, ou mude a extensão do arquivo de seus arquivos releavantes como `.vitepress/config.js` para `.mjs`/`.mts`. Refira-se ao [Guia de resolução de problemas Vite](http://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only) para mais detalhes. Além disso, dentro de contextos de JavaScript comum assíncronos, você pode usar `await import('vitepress')`.

:::

### Assistente de Instalação {#setup-wizard}

VitePress tem embutido um assistente de instalação pela linha de comando que irá ajudar a construir um projeto básico. Depois da instalação, inicie o assistente rodando:

::: code-group

```sh [npm]
$ npx vitepress init
```

```sh [pnpm]
$ pnpm vitepress init
```

```sh [yarn]
$ yarn vitepress init
```

```sh [bun]
$ bun vitepress init
```

:::

Você será cumprimentado com algumas perguntas simples:

<<< @/snippets/init.ansi

::: tip Vue como Dependência Correspondente
Se você tem a intenção de realizar personalização que usa componentes Vue ou APIs, você deve instalar explicitamente `vue` como uma dependência correspondente.
:::

## Estrutura de Arquivos {#file-structure}

Se você estiver construindo um site VitePress individual, você pode desenvolver seu site no diretório atual (`./`). Entretanto, se você está instalando VitePress em um projeto existente juntamente com outro código fonte, é recomendado construir o site em um diretório aninhado (e.g. `./docs`) para que esteja separado do resto do seu projeto.

Assumindo qa escolha de desenvolver o projeto VitePress em `./docs`, a estrutura de arquivos gerada deve parecer com a seguinte:

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

O diretório `docs` é considerado a **raiz do projeto** do seu site VitePress. O diretório `.vitepress` é um local reservado para arquivos de configuração VitePress, cache do servidor de desenvolvimento, resultados da build, e código de personalização de tema opcional.

::: tip
Por padrão, VitePress armazena o cache do servidor de desenvolvimento em `.vitepress/cache`, e o resultado da build de produção em `.vitepress/dist`. Se usar Git, você deve adicioná-los ao seu arquivo `.gitignore`. Estes locais também podem ser [configurados](../reference/site-config#outdir).
:::

### O arquivo de configuração {#the-config-file}

O arquivo de configuração (`.vitepress/config.js`) permite que você personalize vários aspectos do seu site VitePress, com as opções mais básicas sendo o título e a descrição do site:

```js [.vitepress/config.js]
export default {
  // opções a nível do site
  title: 'VitePress',
  description: 'Só uma brincadeira.',

  themeConfig: {
    // opções a nível do tema
  }
}
```

Você também pode configurar o comportamento do tema através da opção `themeConfig`. Consulte a [Referência de Configuração](../reference/site-config) para detalhes completos sobre todas as opções de configuração.

### Arquivos Fonte {#source-files}

Arquivos Markdown fora do diretório `.vitepress` são considerados **arquivos fonte**.

VitePress usa **roteamento baseado em arquivos**: cada arquivo `.md` é compilado em um arquivo correspondente `.html` com o mesmo caminho. Por exemplo, `index.md` será compilado em `index.html`, e pode ser visitado no caminho raiz `/` do site VitePress resultante.

VitePress também fornece a habilidade de gerar URLs limpas, reescrever caminhos, e gerar páginas dinamicamente. Estes serão tratados no [Guia de Roteamento](./routing).

## Instalado e Funcionando {#up-and-running}

A ferramenta deve ter também injetado os seguintes scripts npm no seu `package.json` se você permitiu isso durante o processo de instalação:

```json [package.json]
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  ...
}
```

O script `docs:dev` iniciará um servidor de desenvolvimento local com atualizações instantâneas. Rode-o com o seguinte comando:

::: code-group

```sh [npm]
$ npm run docs:dev
```

```sh [pnpm]
$ pnpm run docs:dev
```

```sh [yarn]
$ yarn docs:dev
```

```sh [bun]
$ bun run docs:dev
```

:::

Em vez de scripts npm, você também pode invocar VitePress diretamente com:

::: code-group

```sh [npm]
$ npx vitepress dev docs
```

```sh [pnpm]
$ pnpm vitepress dev docs
```

```sh [yarn]
$ yarn vitepress dev docs
```

```sh [bun]
$ bun vitepress dev docs
```

:::

Mais usos da linha de comando estão documentados na [Referência CLI](../reference/cli).

O servidor de desenvolvimento deve estar rodando em `http://localhost:5173`. Visite a URL no seu navegador para ver o seu novo site em ação!

## O que vem depois? {#what-s-next}

- Para melhor entender como arquivos markdown são mapeados no HTML gerado, prossiga para o [Guia de Roteamento](./routing).

- Para descobrir mais sobre o que você pode fazer em uma página, como escrever conteúdo markdown ou usar um componente Vue, refira-se a seção "Escrevendo" do guia. Um ótimo lugar para começar seria aprendendo mais sobre [Extensões Markdown](./markdown).

- Para explorar as funcionalidades fornecidas pelo tema padrão da documentação, confira a [Referência de Configuração do Tema Padrão](../reference/default-theme-config).

- Se você quer aprofundar a personalização da aparência do seu site, explore tanto em [Estenda o Tema Padrão](./extending-default-theme) como [Construa um Tema Personalizado](./custom-theme).

- Uma vez que sua documentação tomar forma, certifique-se de ler o [Guia de Lançamento](./deploy).
