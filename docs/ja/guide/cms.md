---
outline: deep
---

# CMS との接続 {#connecting-to-a-cms}

## 全体のワークフロー {#general-workflow}

VitePress を CMS と接続する際は、主に [動的ルーティング](./routing#dynamic-routes) を中心に考えることになります。先にその仕組みを理解しておいてください。

CMS ごとに動作が異なるため、ここでは各自の環境に合わせて調整できる汎用的なワークフローのみを示します。

1. CMS が認証を必要とする場合は、API トークンを格納するための `.env` を作成し、次のように読み込みます。

    ```js
    // posts/[id].paths.js
    import { loadEnv } from 'vitepress'

    const env = loadEnv('', process.cwd())
    ```

2. CMS から必要なデータを取得し、適切なパスデータの形式に整形します。

    ```js
    export default {
      async paths() {
        // 必要に応じて各 CMS のクライアントライブラリを使用
        const data = await (await fetch('https://my-cms-api', {
          headers: {
            // 必要ならトークン
          }
        })).json()

        return data.map(entry => {
          return {
            params: { id: entry.id, /* title, authors, date など */ },
            content: entry.content
          }
        })
      }
    }
    ```

3. ページ内でコンテンツをレンダリングします。

    ```md
    # {{ $params.title }}

    - {{ $params.date }} に {{ $params.author }} が作成

    <!-- @content -->
    ```

## 連携ガイドの募集 {#integration-guides}

特定の CMS と VitePress の連携ガイドを書かれた方は、下部の「Edit this page」リンクからぜひ投稿してください！
