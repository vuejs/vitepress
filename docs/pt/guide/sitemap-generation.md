# Geração de Sitemap {#sitemap-generation}

VitePress vem com suporte embutido para gerar um arquivo `sitemap.xml` para seu site. Para habilitar, adicione o seguinte ao seu `.vitepress/config.js`:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  sitemap: {
    hostname: 'https://example.com'
  }
})
```

Para ter tags `<lastmod>` em seu `sitemap.xml`, você pode habilitar a opção [`lastUpdated`](../reference/default-theme-last-updated).

## Opções {#options}

O suporte de Sietmap é alimentado pelo módulo [`sitemap`](https://www.npmjs.com/package/sitemap). Você pode passar qualquer uma das opções suportadas por ele na opção `sitemap` do seu arquivo de configuração. Esses serão passados diretamente ao construtor `SitemapStream`. Refira-se a [documentação `sitemap`](https://www.npmjs.com/package/sitemap#options-you-can-pass) para mais detalhes. Exemplo:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  sitemap: {
    hostname: 'https://example.com',
    lastmodDateOnly: false
  }
})
```

## Gancho `transformItems`

Você pode usar o gancho `sitemap.transformItems` para modificar os itens do sitemap antes de eles serem escritos no arquivo `sitemap.xml`. Este gancho é chamado com um _array_ de itens sitemap e espera um _array_ de itens sitemap como retorno. Exemplo:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  sitemap: {
    hostname: 'https://example.com',
    transformItems: (items) => {
      // adiciona novos itens ou modifica/filtra itens existentes
      items.push({
        url: '/extra-page',
        changefreq: 'monthly',
        priority: 0.8
      })
      return items
    }
  }
})
```
