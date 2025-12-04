---
outline: deep
---

# VitePress サイトをデプロイする {#deploy-your-vitepress-site}


以下のガイドは、次の前提に基づいています。

- VitePress のサイトはプロジェクトの `docs` ディレクトリ内にある。
- デフォルトのビルド出力ディレクトリ（`.vitepress/dist`）を使用している。
- VitePress はプロジェクトのローカル依存としてインストールされており、`package.json` に次のスクリプトが設定されている。

```json [package.json]
 {
   "scripts": {
     "docs:build": "vitepress build docs",
     "docs:preview": "vitepress preview docs"
   }
 }
```

## ローカルでビルドしてテストする {#build-and-test-locally}


1. 次のコマンドでドキュメントをビルドします。

   ```sh
    $ npm run docs:build
   ```

2. ビルド後、次のコマンドでローカルプレビューします。

   ```sh
    $ npm run docs:preview
   ```

    `preview` コマンドはローカルの静的 Web サーバーを起動し、出力ディレクトリ `.vitepress/dist` を `http://localhost:4173` で配信します。プロダクションへプッシュする前に見た目を確認できます。

3. `--port` 引数でサーバーのポートを設定できます。

   ```json
    {
      "scripts": {
        "docs:preview": "vitepress preview docs --port 8080"
      }
    }
   ```

    これで `docs:preview` は `http://localhost:8080` でサーバーを起動します。

## 公開ベースパスの設定 {#setting-a-public-base-path}


デフォルトでは、サイトはドメインのルートパス（`/`）にデプロイされることを想定しています。サイトをサブパス、例：`https://mywebsite.com/blog/` で配信する場合は、VitePress の設定で [`base`](../reference/site-config#base) オプションを `'/blog/'` に設定してください。

**例:** GitHub（または GitLab）Pages に `user.github.io/repo/` としてデプロイするなら、`base` を `/repo/` に設定します。

## HTTP キャッシュヘッダー {#http-cache-headers}


本番サーバーの HTTP ヘッダーを制御できる場合は、`cache-control` ヘッダーを設定して、再訪時のパフォーマンスを向上させましょう。

本番ビルドでは静的アセット（JavaScript、CSS、`public` 以外のインポートアセット）にハッシュ付きファイル名が使用されます。ブラウザの開発者ツールのネットワークタブで本番プレビューを確認すると、`app.4f283b18.js` のようなファイルが見られます。

この `4f283b18` ハッシュはファイル内容から生成されます。同じハッシュの URL は同じ内容を必ず返し、内容が変われば URL も変わります。したがって、これらのファイルには最も強いキャッシュヘッダーを安全に適用できます。これらのファイルは出力ディレクトリ内の `assets/` 配下に配置されるため、次のヘッダーを設定できます。

```
Cache-Control: max-age=31536000,immutable
```

::: details Netlify の `_headers` ファイル例

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

注：`_headers` ファイルは [public ディレクトリ](./asset-handling#the-public-directory) に配置します（この例では `docs/public/_headers`）。そうすると、ビルド出力にそのままコピーされます。

[Netlify のカスタムヘッダードキュメント](https://docs.netlify.com/routing/headers/)

:::

::: details `vercel.json` による Vercel 設定例

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

注：`vercel.json` は **リポジトリのルート** に配置してください。

[Vercel のヘッダー設定ドキュメント](https://vercel.com/docs/concepts/projects/project-configuration#headers)

:::

## プラットフォーム別ガイド {#platform-guides}


### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render {#netlify-vercel-cloudflare-pages-aws-amplify-render}

新しいプロジェクトを作成し、ダッシュボードで次の設定に変更します。

- **Build Command:** `npm run docs:build`
- **Output Directory:** `docs/.vitepress/dist`
- **Node Version:** `20`（以上）

::: warning
HTML の _Auto Minify_ のようなオプションを有効にしないでください。Vue にとって意味のあるコメントが出力から削除され、削除されるとハイドレーションの不整合エラーが発生する可能性があります。
:::

### GitHub Pages {#github-pages}

1. プロジェクトの `.github/workflows` ディレクトリに `deploy.yml` を作成し、以下の内容を記述します。

   ```yaml [.github/workflows/deploy.yml]
    # Sample workflow for building and deploying a VitePress site to GitHub Pages
    #
    name: Deploy VitePress site to Pages

    on:
      # Runs on pushes targeting the `main` branch. Change this to `master` if you're
      # using the `master` branch as the default branch.
      push:
        branches: [main]

      # Allows you to run this workflow manually from the Actions tab
      workflow_dispatch:

    # Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
    permissions:
      contents: read
      pages: write
      id-token: write

    # Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
    # However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
    concurrency:
      group: pages
      cancel-in-progress: false

    jobs:
      # Build job
      build:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout
            uses: actions/checkout@v5
            with:
              fetch-depth: 0 # Not needed if lastUpdated is not enabled
          # - uses: pnpm/action-setup@v4 # Uncomment this block if you're using pnpm
          #   with:
          #     version: 9 # Not needed if you've set "packageManager" in package.json
          # - uses: oven-sh/setup-bun@v1 # Uncomment this if you're using Bun
          - name: Setup Node
            uses: actions/setup-node@v6
            with:
              node-version: 24
              cache: npm # or pnpm / yarn
          - name: Setup Pages
            uses: actions/configure-pages@v4
          - name: Install dependencies
            run: npm ci # or pnpm install / yarn install / bun install
          - name: Build with VitePress
            run: npm run docs:build # or pnpm docs:build / yarn docs:build / bun run docs:build
          - name: Upload artifact
            uses: actions/upload-pages-artifact@v3
            with:
              path: docs/.vitepress/dist

      # Deployment job
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
    VitePress の `base` オプションが正しく設定されていることを確認してください。詳細は [公開ベースパスの設定](#公開ベースパスの設定) を参照してください。
    :::

2. リポジトリ設定の「Pages」メニューで、「Build and deployment > Source」を「GitHub Actions」に設定します。

3. 変更を `main` ブランチにプッシュし、GitHub Actions の完了を待ちます。設定に応じて、サイトは `https://<username>.github.io/[repository]/` または `https://<custom-domain>/` にデプロイされます。以後、`main` へのプッシュごとに自動デプロイされます。

### GitLab Pages {#gitlab-pages}

1. VitePress の設定で `outDir` を `../public` に設定します。`https://<username>.gitlab.io/<repository>/` にデプロイする場合は `base` を `'/<repository>/'` に設定します。カスタムドメイン、ユーザー／グループページ、または GitLab の「Use unique domain」を有効にしている場合は `base` は不要です。

2. プロジェクトのルートに `.gitlab-ci.yml` を作成して、以下を追加します。これにより、コンテンツを更新するたびにサイトがビルド・デプロイされます。

   ```yaml [.gitlab-ci.yml]
    image: node:18
    pages:
      cache:
        paths:
          - node_modules/
      script:
        # - apk add git # Uncomment this if you're using small docker images like alpine and have lastUpdated enabled
        - npm install
        - npm run docs:build
      artifacts:
        paths:
          - public
      only:
        - main
   ```

### Azure Static Web Apps {#azure-static-web-apps}

1. [公式ドキュメント](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration) に従います。

2. 設定ファイルで次の値を指定します（`api_location` のように不要なものは削除）。

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### Firebase {#firebase}

1. プロジェクトのルートに `firebase.json` と `.firebaserc` を作成します。

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
        "default": "<YOUR_FIREBASE_ID>"
      }
    }
   ```

2. `npm run docs:build` の後、次のコマンドでデプロイします。

   ```sh
    firebase deploy
   ```

### Surge {#surge}

1. `npm run docs:build` の後、次のコマンドでデプロイします。

   ```sh
    npx surge docs/.vitepress/dist
   ```

### Heroku {#heroku}

1. [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static) のドキュメントとガイドに従います。

2. プロジェクトのルートに `static.json` を作成し、以下を記述します。

   ```json [static.json]
    {
      "root": "docs/.vitepress/dist"
    }
   ```

### Edgio {#edgio}

[Creating and Deploying a VitePress App To Edgio](https://docs.edg.io/guides/vitepress) を参照してください。

### Kinsta Static Site Hosting {#kinsta-static-site-hosting}

[VitePress](https://kinsta.com/static-site-hosting/) を [こちらの手順](https://kinsta.com/docs/vitepress-static-site-example/) に従ってデプロイできます。

### Stormkit {#stormkit}

[VitePress プロジェクトを Stormkit にデプロイ](https://stormkit.io/blog/how-to-deploy-vitepress) する手順を参照してください。

### CloudRay {#cloudray}

[CloudRay](https://cloudray.io/) でのデプロイ方法は [こちらの手順](https://cloudray.io/articles/how-to-deploy-vitepress-site) を参照してください。

### Nginx {#nginx}

以下は Nginx サーバーブロックの設定例です。一般的なテキスト系アセットの gzip 圧縮、VitePress サイトの静的ファイル配信における適切なキャッシュヘッダー、そして `cleanUrls: true` のハンドリングを含みます。

```nginx
server {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    listen 80;
    server_name _;
    index index.html;

    location / {
        # content location
        root /app;

        # exact matches -> reverse clean urls -> folders -> not found
        try_files $uri $uri.html $uri/ =404;

        # non existent pages
        error_page 404 /404.html;

        # a folder without index.html raises 403 in this setup
        error_page 403 /404.html;

        # adjust caching headers
        # files in the assets folder have hashes filenames
        location ~* ^/assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

この設定は、ビルド済みの VitePress サイトがサーバー上の `/app` ディレクトリに配置されていることを想定しています。サイトのファイルが別の場所にある場合は、`root` ディレクティブを適宜変更してください。

::: warning index.html をデフォルトにしない
`try_files` の解決先を、他の Vue アプリのように index.html にフォールバックさせないでください。不正なページ状態になります。
:::

詳細は [公式 nginx ドキュメント](https://nginx.org/en/docs/)、Issue [#2837](https://github.com/vuejs/vitepress/discussions/2837)、[#3235](https://github.com/vuejs/vitepress/issues/3235)、および Mehdi Merah 氏の [ブログ記事](https://blog.mehdi.cc/articles/vitepress-cleanurls-on-nginx-environment#readings) を参照してください。
