---
outline: deep
---

# Conectando a um CMS {#connecting-to-a-cms}

## Fluxo de Trabalho Geral {#general-workflow}

Conectar VitePress a um CMS orbitará majoritariamente sobre [Rotas Dinâmicas](./routing#dynamic-routes). Certifique-se de entender como funcionam antes de proceder.

Como cada CMS funcionará de forma diferente, aqui podemos fornecer apenas um fluxo de trabalho genérico que precisará ser adaptado para cada cenário específico.

1. Se seu CMS exige autenticação, crie um arquivo `.env` para armazenar os tokens da API e carregá-los como:

    ```js
    // posts/[id].paths.js
    import { loadEnv } from 'vitepress'

    const env = loadEnv('', process.cwd())
    ```

2. Obtenha os dados necessários do CMS e formate-os em caminhos de dados apropriados:

    ```js
    export default {
      async paths() {
        // use a biblitoca do cliente CMS respectiva se preciso
        const data = await (await fetch('https://my-cms-api', {
          headers: {
            // token se necessário
          }
        })).json()

        return data.map(entry => {
          return {
            params: { id: entry.id, /* título, autores, data, etc. */ },
            content: entry.content
          }
        })
      }
    }
    ```

3. Apresente o conteúdo na página:

    ```md
    # {{ $params.title }}

    - por {{ $params.author }} em {{ $params.date }}

    <!-- @content -->
    ```

## Guias de Integração {#integration-guides}

Se você tiver escrito um guia sobre como integrar VitePress com um CMS específico, por favor use o link "Edite esta página" abaixo para enviá-lo para cá!
