# Carregamento de Dados em Tempo de Compilação {#build-time-data-loading}

VitePress fornece um recurso chamado **carregadores de dado** que permite carregar dados arbitrários e importá-los de páginas ou de componentes. O carregamento de dados é executado **apenas no tempo da construção**: os dados resultantes serão serializados como JSON no pacote JavaScript final.

Os carregadores de dados podem ser usados para buscar dados remotos ou gerar metadados com base em arquivos locais. Por exemplo, você pode usar carregadores de dados para processar todas as suas páginas API locais e gerar automaticamente um índice de todas as entradas da API.

## Uso Básico {#basic-usage}

Um arquivo de carregador de dados deve terminar com `.data.js` ou `.data.ts`. O arquivo deve fornecer uma exportação padrão de um objeto com o método `load()`:

```js [example.data.js]
export default {
  load() {
    return {
      hello: 'world'
    }
  }
}
```

O módulo do carregador é avaliado apenas no Node.js, então você pode importar APIs Node e dependências npm conforme necessário.

Você pode então importar dados deste arquivo em páginas `.md` e componentes `.vue` usando a exportação nomeada `data`:

```vue
<script setup>
import { data } from './example.data.js'
</script>

<pre>{{ data }}</pre>
```

Saída:

```json
{
  "hello": "world"
}
```

Você notará que o próprio carregador de dados não exporta o `data`. É o VitePress chamando o método `load()` nos bastidores e expondo implicitamente o resultado por meio da exportação nomeada `data`.

Isso funciona mesmo se o carregador for assíncrono:

```js
export default {
  async load() {
    // buscar dados remotos
    return (await fetch('...')).json()
  }
}
```

## Dados de Arquivos Locais {#data-from-local-files}

Quando você precisa gerar dados com base em arquivos locais, você deve usar a opção `watch` no carregador de dados para que as alterações feitas nesses arquivos possam acionar atualizações rápidas.

A opção `watch` também é conveniente porque você pode usar [padrões glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) para corresponder a vários arquivos. Os padrões podem ser relativos ao próprio arquivo do carregador, e a função `load()` receberá os arquivos correspondentes como caminhos absolutos.

O exemplo a seguir mostra o carregamento de arquivos CSV e a transformação deles em JSON usando [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/). Como este arquivo só é executado no tempo da construção, você não enviará o procesador CSV para o cliente!

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    // watchedFiles será um array de caminhos absolutos dos arquivos correspondidos.
    // gerar um array de metadados de post que pode ser usada para mostrar
    // uma lista no layout do tema
    return watchedFiles.map((file) => {
      return parse(fs.readFileSync(file, 'utf-8'), {
        columns: true,
        skip_empty_lines: true
      })
    })
  }
}
```

## `createContentLoader`

Ao construir um site focado em conteúdo, frequentemente precisamos criar uma página de "arquivo" ou "índice": uma página onde listamos todas as entradas disponíveis em nossa coleção de conteúdo, por exemplo, artigos de blog ou páginas de API. Nós **podemos** implementar isso diretamente com a API de carregador de dados, mas como este é um caso de uso tão comum, VitePress também fornece um auxiliar `createContentLoader` para simplificar isso:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', /* opções */)
```

O auxiliar aceita um padrão glob relativo ao [diretório fonte](./routing#source-directory) e retorna um objeto de carregador de dados `{ watch, load }` que pode ser usado como exportação padrão em um arquivo de carregador de dados. Ele também implementa cache com base nos selos de data do arquivo para melhorar o desempenho no desenvolvimento.

Note que o carregador só funciona com arquivos Markdown - arquivos não-Markdown correspondidos serão ignorados.

Os dados carregados serão um _array_ com o tipo `ContentData[]`:

```ts
interface ContentData {
  // URL mapeada para a página. Ex: /posts/hello.html (não inclui a base)
  // itere manualmente ou use `transform` personalizado para normalizar os caminhos
  url: string
  // dados frontmatter da página
  frontmatter: Record<string, any>

  // os seguintes estão presentes apenas se as opções relevantes estiverem habilitadas
  // discutiremos sobre eles abaixo
  src: string | undefined
  html: string | undefined
  excerpt: string | undefined
}
```

Por padrão, apenas `url` e `frontmatter` são fornecidos. Isso ocorre porque os dados carregados serão incorporados como JSON no pacote do cliente, então precisamos ser cautelosos com seu tamanho. Aqui está um exemplo de como usar os dados para construir uma página de índice de blog mínima:

```vue
<script setup>
import { data as posts } from './posts.data.js'
</script>

<template>
  <h1>Todos os posts do blog</h1>
  <ul>
    <li v-for="post of posts">
      <a :href="post.url">{{ post.frontmatter.title }}</a>
      <span>por {{ post.frontmatter.author }}</span>
    </li>
  </ul>
</template>
```

### Opções {#options}

Os dados padrão podem não atender a todas as necessidades - você pode optar por transformar os dados usando opções:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // incluir fonte markdown crua?
  render: true,     // incluir HTML completo da página apresentada?
  excerpt: true,    // incluir excerto?
  transform(rawData) {
    // mapeie, ordene ou filtre os dados crus conforme quiser.
    // o resultado final é o que será enviado ao cliente.
    return rawData.sort((a, b) => {
      return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    }).map((page) => {
      page.src     // fonte markdown crua
      page.html    // HTML completo da página apresentada
      page.excerpt // HTML do excerto apresentado (conteúdo acima do primeiro `---`)
      return {/* ... */}
    })
  }
})
```

Veja como é usado no [blog Vue.js](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts).

A API `createContentLoader` também pode ser usada dentro dos [ganchos de construção](../reference/site-config#build-hooks):

```js [.vitepress/config.js]
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // gerar arquivos com base nos metadados dos posts, por exemplo, feed RSS
  }
}
```

**Tipos**

```ts
interface ContentOptions<T = ContentData[]> {
  /**
   * Incluir src?
   * @default false
   */
  includeSrc?: boolean

  /**
   * Renderizar src para HTML e incluir nos dados?
   * @default false
   */
  render?: boolean

  /**
   * Se `boolean`, deve-se processar e incluir o resumo? (apresentado como HTML)
   *
   * Se `function`, controla como o excerto é extraído do conteúdo.
   *
   * Se `string`, define um separador personalizado a ser usado para extrair o
   * excerto. O separador padrão é `---` se `excerpt` for `true`.
   *
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt_separator
   *
   * @default false
   */
  excerpt?:
    | boolean
    | ((file: { data: { [key: string]: any }; content: string; excerpt?: string }, options?: any) => void)
    | string

  /**
   * Transforma os dados. Observe que os dados serão incorporados como JSON no pacote do cliente
   * se importados de componentes ou arquivos markdown.
   */
  transform?: (data: ContentData[]) => T | Promise<T>
}
```

## Carregadores de Dados com Tipos {#typed-data-loaders}

Ao usar TypeScript, você pode tipar seu carregador e exportar `data` da seguinte forma:

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // tipo de dado
}

declare const data: Data
export { data }

export default defineLoader({
  // opções do carregador verificadas pelo tipo
  watch: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```

## Configuração {#configuration}

Para obter as informações de configuração dentro de um carregador, você pode usar um código como este:

```ts
import type { SiteConfig } from 'vitepress'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
```
