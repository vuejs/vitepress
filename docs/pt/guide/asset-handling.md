# Manipulação de Ativos {#asset-handling}

## Referenciando Ativos Estáticos {#referencing-static-assets}

Todos os arquivos Markdown são compilados em componentes Vue e processados por [Vite](https://vitejs.dev/guide/assets.html). Você pode **e deve** referenciar quaisquer ativos usando URLs relativas:

```md
![Uma imagem](./imagem.png)
```

Você pode referenciar ativos estáticos em seus arquivos markdown, seus componentes `*.vue` no tema, estilos e simples arquivos `.css`, usando caminhos públicos absolutos (com base na raiz do projeto) ou caminhos relativos (com base em seu sistema de arquivos). Este último é semelhante ao comportamento que você está acostumado se já usou Vite, Vue CLI ou o `file-loader` do webpack.

Tipos comuns de arquivos de imagem, mídia e fonte são detectados e incluídos automaticamente como ativos.

Todos os ativos referenciados, incluindo aqueles usando caminhos absolutos, serão copiados para o diretório de saída com um nome de arquivo hash na compilação de produção. Ativos nunca referenciados não serão copiados. Ativos de imagem menores que 4KB serão incorporados em base64 - isso pode ser configurado pela opção [`vite`](../reference/site-config#vite) da configuração.

Todas as referências de caminho **estáticas**, incluindo caminhos absolutos, devem ser baseadas na estrutura do seu diretório de trabalho.

## O Diretório Público {#the-public-directory}

Às vezes, pode ser necessário fornecer ativos estáticos que não são referenciados diretamente em nenhum de seus componentes do tema ou Markdown, ou você pode querer servir certos arquivos com o nome de arquivo original. Exemplos de tais arquivos incluem `robots.txt`, favicons e ícones PWA.

Você pode colocar esses arquivos no diretório `public` sob o [diretório fonte](./routing#source-directory). Por exemplo, se a raiz do seu projeto for `./docs` e estiver usando a localização padrão do diretório fonte, então o diretório público será `./docs/public`.

Os ativos colocados em `public` serão copiados para a raiz do diretório de saída como são.

Observe que você deve referenciar arquivos colocados em `public` usando o caminho absoluto da raiz - por exemplo, `public/icon.png` deve sempre ser referenciado no código fonte como `/icon.png`.

## URL Base {#base-url}

Se seu site for implantado em uma URL que não seja a raiz, será necessário definir a opção `base` em `.vitepress/config.js`. Por exemplo, se você planeja implantar seu site em `https://foo.github.io/bar/`, então `base` deve ser definido como `'/bar/'` (sempre deve começar e terminar com uma barra).

Todos os caminhos dos seus ativos estáticos são processados automaticamente para se ajustar aos diferentes valores de configuração `base`. Por exemplo, se você tiver uma referência absoluta a um ativo sob `public` no seu markdown:

```md
![Uma imagem](/imagem-dentro-de-public.png)
```

Você **não** precisa atualizá-lo quando alterar o valor de configuração `base` nesse caso.

No entanto, se você estiver criando um componente de tema que vincula ativos dinamicamente, por exemplo, uma imagem cujo `src` é baseado em um valor de configuração do tema:

```vue
<img :src="theme.logoPath" />
```

Nesse caso, é recomendável envolver o caminho com o [`auxiliar withBase`](../reference/runtime-api#withbase) fornecido por VitePress:

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```
