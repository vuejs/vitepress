---
outline: deep
---

# Implante seu Site VitePress {#deploy-your-vitepress-site}

Os guias a seguir são baseados em alguns pressupostos:

- O site VitePress está dentro do diretório `docs` do seu projeto.
- Você está usando o diretório de saída de compilação padrão (`.vitepress/dist`).
- VitePress está instalado como uma dependência local em seu projeto, e você configurou os seguintes scripts em seu `package.json`:

  ```json [package.json]
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:preview": "vitepress preview docs"
    }
  }
  ```

## Compilar e Testar Localmente {#build-and-test-locally}

1. Execute este comando para compilar a documentação:

   ```sh
   $ npm run docs:build
   ```

2. Após a compilação, veja a prévia local executando:

   ```sh
   $ npm run docs:preview
   ```

   O comando `preview` inicializará um servidor web estático local que servirá o diretório de saída `.vitepress/dist` em `http://localhost:4173`. Você pode usar isso para garantir que tudo esteja correto antes de enviar para produção.

3. Você pode configurar a porta do servidor passando `--port` como argumento.

   ```json
   {
     "scripts": {
       "docs:preview": "vitepress preview docs --port 8080"
     }
   }
   ```

   Agora o método `docs:preview` implantará o servidor em `http://localhost:8080`.

## Configurando um Caminho Base Público {#setting-a-public-base-path}

Por padrão, assumimos que o site será implantado no caminho raiz de um domínio (`/`). Se seu site for servido em um subcaminho, por exemplo, `https://meusite.com/blog/`, você precisa então configurar a opção [`base`](../reference/site-config#base) para `'/blog/'` na configuração VitePress.

**Exemplo:** Ao usar GitHub Pages (ou GitLab Pages) e implantar em `user.github.io/repo/`, defina seu `base` como `/repo/`.

## Cabeçalhos de Cache HTTP {#http-cache-headers}

Se você tiver controle sobre os cabeçalhos HTTP de seu servidor em produção, pode-se configurar cabeçalhos `cache-control` para obter melhor desempenho em visitas repetidas.

A compilação de produção usa nomes de arquivos com hash para ativos estáticos (JavaScript, CSS e outros ativos importados que não estão em `public`). Se você inspecionar a prévia de produção usando as ferramentas de desenvolvedor do seu nevegador na aba rede, verá arquivos como `app.4f283b18.js`.

Este hash `4f283b18` é gerado a partir do conteúdo deste arquivo. A mesma URL com hash é garantida para servir o mesmo conteúdo do arquivo - se o conteúdo mudar, as URLs também mudam. Isso significa que você pode usar com segurança os cabeçalhos de cache mais fortes para esses arquivos. Todos esses arquivos serão colocados em `assets/` no diretório de saída, então você pode configurar o seguinte cabeçalho para eles:

```
Cache-Control: max-age=31536000,immutable
```

::: details Exemplo de arquivo `_headers` do Netlify

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

Nota: o arquivo `_headers` deve ser colocado no [diretório public](./asset-handling#the-public-directory) - em nosso caso, `docs/public/_headers` - para que ele seja copiado exatamente para o diretório de saída.

[Documentação de cabeçalhos personalizados do Netlify](https://docs.netlify.com/routing/headers/)

:::

::: details Exemplo de configuração Vercel em `vercel.json`

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Nota: o arquivo `vercel.json` deve ser colocado na raiz do seu **repositório**.

[Documentação Vercel sobre configuração de cabeçalhos](https://vercel.com/docs/concepts/projects/project-configuration#headers)

:::

## Guias de Plataforma {#platform-guides}

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render

Configure um novo projeto e altere estas configurações usando seu painel:

- **Comando de Compilação:** `npm run docs:build`
- **Diretório de Saída:** `docs/.vitepress/dist`
- **Versão do Node:** `18` (ou superior)

::: warning
Não ative opções como _Auto Minify_ para código HTML. Isso removerá comentários da saída que têm significado para Vue. Haverão erros de incompatibilidade de hidratação se forem removidos.
:::

### GitHub Pages

1. Crie um arquivo chamado `deploy.yml` dentro do diretório `.github/workflows` do seu projeto com algum conteúdo como este:

   ```yaml [.github/workflows/deploy.yml]
   # Exemplo de fluxo de trabalho para compilar e implantar um site VitePress no GitHub Pages
   #
   name: Implante o site VitePress no Pages

   on:
     # Executa em pushes direcionados à branch `main`.
     # Altere para `master` se estiver usando a branch `master` como padrão.
     push:
       branches: [main]

     # Permite executar manualmente este fluxo de trabalho na guia Actions
     workflow_dispatch:

   # Define permissões GITHUB_TOKEN para a implantação no GitHub Pages
   permissions:
     contents: read
     pages: write
     id-token: write

   # Permite apenas uma implantação simultânea, pulando execuções em fila entre a execução em andamento e a última da fila.
   # No entanto, NÃO cancela execuções em andamento, pois queremos permitir que essas implantações de produção sejam concluídas.
   concurrency:
     group: pages
     cancel-in-progress: false

   jobs:
     # Trabalho de compilação
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
           with:
             fetch-depth: 0 # Não necessário se lastUpdated não estiver habilitado
         # - uses: pnpm/action-setup@v3 # Descomente isso se estiver usando pnpm
         #   with:
         #     version: 9
         # - uses: oven-sh/setup-bun@v1 # Descomente isso se estiver usando Bun
         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm # ou pnpm / yarn
         - name: Setup Pages
           uses: actions/configure-pages@v4
         - name: Install dependencies
           run: npm ci # ou pnpm install / yarn install / bun install
         - name: Build with VitePress
           run: |
             npm run docs:build # ou pnpm docs:build / yarn docs:build / bun run docs:build
             touch docs/.vitepress/dist/.nojekyll
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: docs/.vitepress/dist

     # Trabalho de implantação
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       needs: build
       runs-on: ubuntu-latest
       name: Deploy
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

   ::: warning
   Certifique-se de que a opção `base` em seu VitePress esteja configurada corretamente. Veja [Configurando um Caminho Base Público](#setting-a-public-base-path) para mais detalhes.
   :::

2. Nas configurações do seu repositório sob o item do menu "Pages", selecione "GitHub Actions" em "Build and deployment > Source".

3. Envie suas alterações para a branch `main` e aguarde a conclusão do fluxo de trabalho do GitHub Actions. Você verá seu site implantado em `https://<username>.github.io/[repository]/` ou `https://<custom-domain>/` dependendo das suas configurações. Seu site será implantado automaticamente em cada push para a branch `main`.

### GitLab Pages

1. Defina `outDir` na configuração VitePress como `../public`. Configure a opção `base` para `'/<repository>/'` se você deseja implantar em `https://<username>.gitlab.io/<repository>/`.

2. Crie um arquivo chamado `.gitlab-ci.yml` na raiz do seu projeto com o conteúdo abaixo. Isso construirá e implantará seu site sempre que você fizer alterações no conteúdo:

   ```yaml [.gitlab-ci.yml]
   image: node:18
   pages:
     cache:
       paths:
         - node_modules/
     script:
       # - apk add git # Descomente isso se estiver usando imagens pequenas do Docker como o Alpine e tiver lastUpdated habilitado
       - npm install
       - npm run docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

### Azure Static Web Apps {#azure-static-web-apps}

1. Siga a [documentação oficial](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration).

2. Configure esses valores em seu arquivo de configuração (e remova aqueles que você não precisa, como `api_location`):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### Firebase {#firebase}

1. Crie `firebase.json` e `.firebaserc` na raiz do seu projeto:

   `firebase.json`:

   ```json [firebase.json]
   {
     "hosting": {
       "public": "docs/.vitepress/dist",
       "ignore": []
     }
   }
   ```

   `.firebaserc`:

   ```json [.firebaserc]
   {
     "projects": {
       "default": "<SEU_ID_FIREBASE>"
     }
   }
   ```

2. Após executar `npm run docs:build`, execute este comando para implantar:

   ```sh
   firebase deploy
   ```

### Surge

1. Após executar `npm run docs:build`, execute este comando para implantar:

   ```sh
   npx surge docs/.vitepress/dist
   ```

### Heroku

1. Siga a documentação e o guia fornecidos em [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static).

2. Crie um arquivo chamado `static.json` na raiz do seu projeto com o conteúdo abaixo:

   ```json [static.json]
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Edgio

Consulte [Criar e Implantar um Aplicativo VitePress no Edgio](https://docs.edg.io/guides/vitepress).

### Kinsta Static Site Hosting {#kinsta-static-site-hosting}

Você pode implantar seu site VitePress em [Kinsta](https://kinsta.com/static-site-hosting/) seguindo estas [instruções](https://kinsta.com/docs/vitepress-static-site-example/).
